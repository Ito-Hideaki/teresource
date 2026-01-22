export function createLogBox() {
    const box = document.createElement("div");
    box.classList.add("loguibox");

    /** @param { string } sentence */
    function log(sentence) {
        const label = document.createElement("div");
        label.classList.add("loguilabel");
        label.innerHTML = sentence;
        box.appendChild(label);
    }

    return { box, log }
}