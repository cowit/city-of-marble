import { Game } from "./game.js";
import { metal } from "./modules/metal.js";
import { stone } from "./modules/stone.js";
import { temple } from "./modules/temple.js";
import { territory } from "./modules/territory.js";
import { loadSaveFile, saveModuleHandler } from "./saving.js";
globalThis.game = new Game();
const earth = game.createPlanet("Earth");
earth.addModuleLine(territory);
//earth.addModuleLine(foraging)
earth.addModuleLine(metal);
earth.addModuleLine(stone);
earth.addModuleLine(temple);
earth.items.unexploredLand().amount(10);
//earth.items.land().amount(100)
earth.items.housing().amount(50);
earth.items.population().amount(50);
earth.items.labor().amount(250);
earth.items.wood().amount(100);
const tooltipEle = $(`#tooltip`);
const tooltipName = $(`.tooltip-name`);
globalThis.tooltip = {
    display(event, text) {
        tooltipName.text(text);
        tooltipEle
            .show()
            .css("top", event.clientY + 22)
            .css("left", event.clientX + 12);
    },
    hide() { tooltipEle.hide(); }
};
setInterval(game.activate.bind(game), 1000);
$(`#save-button`).on("click", () => { saveModuleHandler(earth); });
$(`#load-button`).on("click", () => { loadSaveFile(window.localStorage.getItem(`saveFile`), earth); });
//# sourceMappingURL=script.js.map