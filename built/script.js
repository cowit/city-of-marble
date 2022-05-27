import { Game } from "./game.js";
import { foraging } from "./modules/food.js";
import { territory } from "./modules/territory.js";
globalThis.game = new Game();
const earth = game.createPlanet("Earth");
earth.addModuleLine(territory);
earth.addModuleLine(foraging);
earth.items.unexploredLand().amount(100);
earth.items.land().amount(100);
earth.items.housing().amount(100);
earth.items.population().amount(100);
earth.items.workForce().amount(100);
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
//# sourceMappingURL=script.js.map