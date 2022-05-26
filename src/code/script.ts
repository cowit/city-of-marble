import { Game } from "./game.js";
import { foraging } from "./modules/food.js";
import { territory } from "./modules/territory.js";
const game = new Game()
const earth = game.createPlanet("Earth")
earth.addModuleLine(territory)
earth.addModuleLine(foraging)
earth.items.unexploredLand().amount(100)

declare global {
    var tooltip: {
        display(event: JQuery.MouseMoveEvent | JQuery.MouseEnterEvent, text: string): void,
        hide(): void
    }
}

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
