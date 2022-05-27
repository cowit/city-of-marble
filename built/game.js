import { Planet } from "./planet.js";
export class Game {
    constructor() {
        this.planets = [];
    }
    createPlanet(name) {
        const planet = new Planet(name);
        this.planets.push(planet);
        return planet;
    }
    activate() {
        this.planets.forEach(pla => { pla.activate(); });
    }
    currentPlanet() {
        return this.planets[0];
    }
}
//# sourceMappingURL=game.js.map