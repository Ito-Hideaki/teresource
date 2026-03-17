import { createConfigUIElement } from "../../configUI";

export function createAndAddSettingsPanel() {
    const { element: panel } = createConfigUIElement(["keyBinding"]);
    panel.style.position = "absolute";
    panel.style.top = `0`;
    panel.style.right = `0`;
    panel.style.height = `100%`;
    panel.style.width = `60%`;
    const normalDisplayStyle = panel.style.display;
    document.getElementById("outer-game-box")?.appendChild(panel);
    return {
        setVisible: function(visibility: boolean) {
            panel.style.display = visibility ? normalDisplayStyle : "none";
        }
    };
}