import { Module, ModuleExporter } from "./module.js";
import { ModuleLine, UIComponent } from "./ui.js";
import { Items } from "./data/items.js"
import { ModifierHandler } from "./modifiers.js";

export class Planet {
    items = new Items()
    modules: Module[] = []
    lines = new Map<string, ModuleLine>()
    moduleContainer = new UIComponent($(`#module-display`))
    globalModifiers = new ModifierHandler<number | string>()

    constructor(public name: string) {
    }

    activate() {
        this.modules.forEach(mod => { mod.activate(this) })
    }

    addModuleLine(createModEx: ((item: Items, globalModifiers: ModifierHandler<number | string>) => ModuleExporter)) {

        const modEx = createModEx(this.items, this.globalModifiers)

        let line = this.lines.get(modEx.id)
        if (!line) {
            line = this.moduleContainer.moduleLine()
            this.lines.set(modEx.id, line)
        }
        modEx.modArray.forEach((mod) => {
            const module = mod(this.items)
            line?.module(module)
            this.modules.push(module)
        })
    }
}
