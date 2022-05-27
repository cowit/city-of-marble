import { UIComponent } from "./ui.js";
import { Items } from "./data/items.js";
import { ModifierHandler } from "./modifiers.js";
export class Planet {
    constructor(name) {
        this.name = name;
        this.items = new Items();
        this.modules = [];
        this.lines = new Map();
        this.moduleContainer = new UIComponent($(`#module-display`));
        this.globalModifiers = new ModifierHandler();
    }
    activate() {
        this.modules.forEach(mod => { mod.activate(this); });
    }
    addModuleLine(createModEx) {
        const modEx = createModEx(this.items, this.globalModifiers);
        let line = this.lines.get(modEx.id);
        if (!line) {
            line = this.moduleContainer.moduleLine();
            this.lines.set(modEx.id, line);
        }
        modEx.modArray.forEach((mod) => {
            const module = mod(this.items);
            line === null || line === void 0 ? void 0 : line.module(module);
            this.modules.push(module);
        });
    }
}
//# sourceMappingURL=planet.js.map