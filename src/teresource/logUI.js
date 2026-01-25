import dayjs from "dayjs";

export function createLogBox() {
    const box = document.createElement("div");
    box.classList.add("loguibox");

    /** @type {HTMLElement[]} */ const labels = [];
    for(let i = 0; i < 10; i++) {
        const label = document.createElement("div");
        labels.push(label);
        label.textContent = "_";
        label.classList.add("loguilabel");
        box.appendChild(label);
    }

    function updateForNewSentence(sentence) {
        labels.forEach((label, i) => {
            if(i+1 == labels.length) label.innerHTML = sentence;
            else label.innerHTML = labels[i+1].innerHTML;
        });
    }

    /** @param { string } sentence */
    function log(sentence) {
        const timeString = dayjs().format("hh:mm:ss.SSS");
        updateForNewSentence(`[${timeString}] ${sentence}`);
    }

    return { box, log }
}