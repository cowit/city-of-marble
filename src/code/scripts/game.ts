import { ModuleHandler } from "./module-handler.js";

export class Game {
    moduleHandlers: ModuleHandler[] = []

    createPlanet(name: string) {
        const planet = new ModuleHandler(name)
        this.moduleHandlers.push(planet)
        return planet
    }

    activate() {
        this.moduleHandlers.forEach(pla => { pla.activate() })
    }

    currentPlanet() {
        return this.moduleHandlers[0]
    }
}