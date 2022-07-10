import { UIComponent } from "./ui.js";
import { Items } from "./data/items.js";
import { ModifierHandler } from "./modifiers.js";
export class ModuleHandler {
    constructor(name) {
        this.name = name;
        this.items = new Items();
        this.lines = new Map();
        this.moduleContainer = new UIComponent($(`#module-display`));
        this.modules = new Map();
        this.globalModifiers = new ModifierHandler();
        this.stringModifiers = new ModifierHandler();
        this.conversions = new Map();
    }
    activate() {
        this.modules.forEach(mod => { mod.activate(); });
        for (const item in this.items) {
            this.items[item]().activate();
        }
    }
    addModuleLine(createModEx) {
        const modEx = createModEx(this.items);
        let line = this.lines.get(modEx.id);
        if (!line) {
            line = this.moduleContainer.moduleLine(modEx, this);
            this.lines.set(modEx.id, line);
        }
        modEx.modArray.forEach((mod) => {
            const module = mod(this.items, modEx.id);
            line === null || line === void 0 ? void 0 : line.module(module);
            if (this.modules.has(module.id)) {
                throw new Error(`Module with ID ${module.id} already exists, please fix conflict.`);
            }
            else
                this.modules.set(module.id, module);
        });
    }
}
//# sourceMappingURL=module-handler.js.map