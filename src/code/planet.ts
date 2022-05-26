import { Module, ModuleExporter } from "./module.js";
import { ModuleLine, UIComponent } from "./ui.js";
import { Items } from "./items/items.js"

export class Planet {
    items = new Items()
    modules: Module[] = []
    lines = new Map<string, ModuleLine>()
    moduleContainer = new UIComponent($(`#module-display`))

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
            this.modules.push(module)
        })
    }
}