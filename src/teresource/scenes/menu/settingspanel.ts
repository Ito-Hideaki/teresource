import { createConfigUIElement } from "../../configUI";

export function createConfigPanel(style: string, categoryKeyList: string[]) {
    const { element: panel, configUIDataHandlerMap } = createConfigUIElement(categoryKeyList);
    panel.style = style;
    const normalDisplayStyle = panel.style.display;
    const container = document.getElementById("outer-game-box");
    container?.appendChild(panel);
    return {
        setVisible: function(visibility: boolean) {
            panel.style.display = visibility ? normalDisplayStyle : "none";
        },
        destroyPanel: function() {
            container?.removeChild(panel);
        },
        configUIDataHandlerMap
    };
}

export function createAndAddSettingsPanel() {
    return createConfigPanel("position: absolute; top: 0; right: 0; height: 100%; width: 70%;", ["keyBinding"]);
}