//const { active } = require("browser-sync");

const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    interval: 4,
    sessions: 0,
}

let interval;

document.addEventListener("DOMContentLoaded", () => {
    //Check to see if browser supports notifications
    console.log(Notification.permission)
    if ("Notification" in window) {
        //Check if notification permission is not granted/denied
        if (Notification.permission !== "denied" && Notification.permission !== "granted") {
            //Ask the user for permission
            Notification.requestPermission().then(function(permission){
                //if permission is granted
                if (permission === "granted") {
                    //Create a new notification
                    new Notification("Cooool!");
                }
            });
        }
        
    }

    switchMode("pomodoro");
})

const buttonModes = document.querySelector("#js-mode-buttons");
buttonModes.addEventListener("click", handleMode);

const buttonSound = new Audio("button-sound.mp3");

const startButton = document.getElementById("js-btn");
startButton.addEventListener("click", () => {
    const {action} = startButton.dataset;

    buttonSound.play();

    if (action === "start") {
        startTimer();
    }
    else {
        stopTimer();
    }
})

function switchMode(mode) {
    console.log("test");
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    }

    document.querySelectorAll("button[data-mode]").forEach(e => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
    document.body.style.backgroundColor = `var(--${mode})`;

    document.getElementById("js-progress").setAttribute("max", timer.remainingTime.total);

    updateClock();
}

function handleMode(event) {
    const {mode} = event.target.dataset;
    if (!mode) {
        return 
    }
    switchMode(mode);
    stopTimer();
}

function updateClock() {

    const {remainingTime} = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, "0");
    const seconds = `${remainingTime.seconds}`.padStart(2, "0");

    const min = document.getElementById("js-minutes");
    const sec = document.getElementById("js-seconds");

    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode === "pomodoro" ? "Keep studying!" : "Take a break!";
    document.title = `${minutes}:${seconds} - ${text}`

    const progress = document.getElementById("js-progress");
    progress.value = timer[timer.mode]*60 - timer.remainingTime.total;
}

function getRemainingTime(et) {
    const currentTime = Date.parse(new Date());
    const difference = et - currentTime;

    const total = Number.parseInt(difference/1000, 10);
    const minutes = Number.parseInt((total/60)%60, 10);
    const seconds = Number.parseInt(total%60, 10);

    return {
        total, 
        minutes, 
        seconds
    };
}

function startTimer() {

    let {total} = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === "pomodoro") {
        timer.sessions++;
    }


    startButton.dataset.action = "stop";
    startButton.textContent = "stop";
    startButton.classList.add("active")
    
    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        
        if(total <= 0) {
            clearInterval(interval);

            switch(timer.mode) {
                case "pomodoro":

                    if (timer.sessions%timer.interval === 0) {
                        switchMode("longBreak");
                    }
                    else {
                        switchMode("shortBreak");
                    }
                    break;
                default:
                    switchMode("pomodoro");
            }
            
            if (Notification.permission === "granted") {
                console.log("TEST");
                const text = timer.mode === "pomodoro" ? "Keep Studying!":"Get back to work!";
                new Notification(text);
            }

            document.querySelector(`[data-sound="${timer.mode}"]`).play();

            startTimer();
        }
    }, 1000)

}

function stopTimer() {
    clearInterval(interval);

    startButton.dataset.action = "start";
    startButton.textContent = "start";
    startButton.classList.remove("active");


}


