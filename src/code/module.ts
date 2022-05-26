import { EventHandler } from "./components/events.js";
import { Conversion } from "./conversions.js";
import { Items } from "./items/items.js";
import { Planet } from "./planet.js";

export class ModuleArguments {
    private _id?: string
    private _name?: string
    private _conversions: Conversion[] = []
    private _button?: ModuleButton
    private _description: string = ""
    private _transforms = new Map<string, ModuleArguments>()
    id(id: string) {
        this._id = id
        return this
    }

    name(name: string) {
        this._name = name
        return this
    }

    description(description: string) {
        this._description = description
        return this
    }

    conversions(conversions: Conversion[]) {
        this._conversions = conversions
        return this
    }

    button(type: "build" | "trigger", title: string, cost: Conversion, transform?: string) {
        this._button = new ModuleButton(type, title, cost, transform)
        return this
    }

    transform(id: string, transform: ModuleArguments) {
        transform.id(id)
        this._transforms.set(id, transform)
        return this
    }

    complete() {
        const mod = (items: Items) => {
            if (!this._id) throw new Error(`A Module Does not have an ID assigned to it.`)
            if (!this._name) throw new Error(`Module ${this._id} does not have a Name assigned to it.`)
            return new Module(items, this._id, this._name, this._description, this._conversions, this._transforms, this._button)
        }
        return mod.bind(this)

    }
}

export class ModuleButton {
    constructor(
        public type: "build" | "trigger",
        public title: string,
        public cost: Conversion,
        public transform?: string
    ) { }
}

export function module() {
    return new ModuleArguments()
}

//The module is what the base interface which interacts with the planet.
export class Module {
    //Event handler which is triggered when the transform method is complete.
    onTransform = new EventHandler<Module>()
    constructor(
        public items: Items,
        public id: string,
        public name: string,
        public description: string,
        public conversions: Conversion[],
        public transforms: Map<string, ModuleArguments>, //A map of module arguments which can be completed and overwrite this module.
        public button?: ModuleButton
    ) { }

    //Called on each activation cycle
    activate(planet: Planet) {
        //Check the conversions, which will consume/output resources
        this.conversions.forEach(con => {
            con.checkConversion()
        })
    }

    //Transform this module using a set of module arguments.
    transform(transformName: string) {
        //Attempt to get the transform from the transforms map.
        const transform = this.transforms.get(transformName)?.complete()(this.items)

        //Check that it pulls one that exists.
        if (transform) {
            const { onTransform, ...transformExcluded } = transform
            Object.assign(this, transformExcluded)
            this.onTransform.trigger(this)
        }
        else console.warn(`Could not find transform ${transformName} on module ${this.id}`)

    }
}

export class ModuleExporter {
    constructor(public id: string, public modArray: ((items: Items) => Module)[]) { }
}