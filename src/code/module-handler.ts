import { Module, ModuleArguments, ModuleExporter } from "./module.js";
import { ModuleLine, UIComponent } from "./ui.js";
import { Items } from "./data/items.js"
import { ModifierHandler } from "./modifiers.js";
import { Conversion } from "./conversions.js";

export class ModuleHandler {
    items = new Items()
    lines = new Map<string, ModuleLine>()
    moduleContainer = new UIComponent($(`#module-display`))
    modules = new Map<string, Module>()
    globalModifiers = new ModifierHandler<number>()
    conversions = new Map<string, Conversion>()

    constructor(public name: string) {
    }

    activate() {
        this.modules.forEach(mod => { mod.activate(this) })
    }

    addModuleLine(createModEx: ((item: Items) => ModuleExporter)) {

        const modEx = createModEx(this.items)

        let line = this.lines.get(modEx.id)
        if (!line) {
            line = this.moduleContainer.moduleLine()
            this.lines.set(modEx.id, line)
        }
        modEx.modArray.forEach((mod) => {
            const module = mod(this.items)
            line?.module(module)
            if (this.modules.has(module.id)) {
                throw new Error(`Module with ID ${module.id} already exists, please fix conflict.`)
            }
            else this.modules.set(module.id, module)
        })
    }
}
