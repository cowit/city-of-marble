var _a;
import { Game } from "./game.js";
import { diplomacy } from "./modules/diplomacy.js";
import { food } from "./modules/food.js";
import { main } from "./modules/main.js";
import { metal } from "./modules/metal.js";
import { stone } from "./modules/stone.js";
import { temple } from "./modules/temple.js";
import { territory } from "./modules/territory.js";
import { loadSaveFile, saveModuleHandler } from "./saving.js";
globalThis.game = new Game();
const earth = game.createPlanet("Earth");
earth.addModuleLine(main);
earth.addModuleLine(territory);
earth.addModuleLine(food);
earth.addModuleLine(diplomacy);
earth.addModuleLine(metal);
earth.addModuleLine(stone);
earth.addModuleLine(temple);
earth.items.unexploredLand().set(10);
//earth.items.housing().amount(1)
//earth.items.land().amount(100)
//earth.items.population().amount(50)
//earth.items.labor().amount(250)
//earth.items.wood().amount(100)
//Hide all non-unlocked lines
earth.lines.forEach(lin => {
    lin.hide();
});
(_a = earth.lines.get(`main`)) === null || _a === void 0 ? void 0 : _a.show();
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
loadSaveFile(window.localStorage.getItem(`saveFile`), earth);
//setInterval(() => { saveModuleHandler(earth) }, 10000)
$(`#save-button`).on("click", () => { saveModuleHandler(earth); });
$(`#load-button`).on("click", () => { loadSaveFile(window.localStorage.getItem(`saveFile`), earth); });
//# sourceMappingURL=script.js.map