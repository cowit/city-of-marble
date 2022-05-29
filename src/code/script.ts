import { Game } from "./game.js";
import { foraging } from "./modules/food.js";
import { territory } from "./modules/territory.js";
import { loadSaveFile, saveModuleHandler } from "./saving.js";
globalThis.game = new Game()
declare global {
    var tooltip: {
        display(event: JQuery.MouseMoveEvent | JQuery.MouseEnterEvent, text: string): void,
        hide(): void
    }
    var game: Game
}
const earth = game.createPlanet("Earth")
earth.addModuleLine(territory)
earth.addModuleLine(foraging)
earth.items.unexploredLand().amount(10)
earth.items.land().amount(100)
earth.items.housing().amount(100)
earth.items.population().amount(100)
earth.items.workForce().amount(100)



const tooltipEle = $(`#tooltip`)
const tooltipName = $(`.tooltip-name`)
globalThis.tooltip = {
    display(event: JQuery.MouseMoveEvent | JQuery.MouseEnterEvent, text: string) {
        tooltipName.text(text)
        tooltipEle
            .show()
            .css("top", event.clientY + 22)
            .css("left", event.clientX + 12)
    },
    hide() { tooltipEle.hide() }
}


setInterval(game.activate.bind(game), 1000)
$(`#save-button`).on("click", () => { saveModuleHandler(earth) })
$(`#load-button`).on("click", () => { loadSaveFile(window.localStorage.getItem(`saveFile`), earth) })
