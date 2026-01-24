import dayjs from "dayjs";

export function createLogBox() {
    const box = document.createElement("div");
    box.classList.add("loguibox");

    /** @param { string } sentence */
    function log(sentence) {
        const label = document.createElement("div");
        label.classList.add("loguilabel");
        const timeString = dayjs().format("hh:mm:ss.SSS");
        label.innerHTML = `[${timeString}] ${sentence}`;
        box.appendChild(label);
    }

    return { box, log }
}