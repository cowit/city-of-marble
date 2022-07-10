import { EventHandler } from "./components/events.js";
import { ModifiableVariable, ModifierHandler, ModifierReference } from "./modifiers.js";
import { conversion, Conversion } from "./conversions.js";
import { Item, ItemRef, Items } from "./data/items.js";
import { ModuleHandler } from "./module-handler.js";
import { UIComponent } from "./ui.js";

export function unlock(target: ModifierReference | Item, operator: `more` | `less` | `equals` | `atleast`, condition: number | string) {
    return new UnlockCondition(target, operator, condition)
}

export class UnlockCondition {
    constructor(
        public target: ModifierReference | Item | ModifiableVariable<string | number>,
        public operator: `more` | `less` | `equals` | `atleast`,
        public condition: number | string
    ) {

        if (target instanceof ModifierReference) {
            this.target = game.currentPlanet().globalModifiers.subscribe(target, 0)
        }
    }

    check() {
        if (typeof this.condition === "string" || this.operator === "equals") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.total === this.condition
            }
            else if (this.target instanceof Item) {
                return this.target.total() === this.condition
            }
        }
        else if (this.operator === "less") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber < this.condition
            }
            else if (this.target instanceof Item) {
                return this.target.total() < this.condition
            }
        }
        else if (this.operator === "more") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber > this.condition
            }
            else if (this.target instanceof Item) {
                return this.target.total() > this.condition
            }
        }
        else if (this.operator === "atleast") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber >= this.condition
            }
            else if (this.target instanceof Item) {
                return this.target.total() >= this.condition
            }
        }
        else throw new Error(`No Targets where compatible in this unlock condition.`)
    }
}

export class ModuleArguments {
    public _id?: string
    public _name?: string
    public _conversions: Conversion[] = []
    private _buttons: ModuleButton[] = []
    private _description: string = ""
    public _transforms = new Map<string, ModuleArguments>()
    public _unlockConditions: UnlockCondition[] = []
    public _lockIDs: string[] = []
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

    button(type: "build" | "trigger" | "buildIncreaseAmount" | "lock", title: string, cost: Conversion, transform?: string) {
        cost.build()

        this._buttons.push(new ModuleButton(type, title, cost, transform))
        return this
    }

    transform(id: string, transform: ModuleArguments) {
        transform.id(id)
        this._transforms.set(id, transform)
        return this
    }

    unlockConditions(conditions: UnlockCondition[], lockIDs?: string[]) {
        this._unlockConditions = conditions
        if (lockIDs) this._lockIDs = lockIDs
        return this
    }

    complete() {
        const mod = (items: Items, lineID: string) => {

            if (!this._id) throw new Error(`A Module Does not have an ID assigned to it.`)
            if (!this._name) throw new Error(`Module ${this._id} does not have a Name assigned to it.`)
            const module = new Module(items,
                this._id,
                this._name,
                this._description,
                this._conversions, this._transforms,
                this._buttons,
                this._unlockConditions,
                true,
                lineID,
                this._lockIDs
            )
            //Inject the module into all items/itemrefs so that they can use it's modifiers.
            module.conversions.forEach(con => {
                con.inputs.forEach(inp => { inp.module = module })
                con.outputs.forEach(out => { out.module = module })
            })
            return module
        }
        return mod.bind(this)

    }
}

export class ModuleButton {
    constructor(
        public type: "build" | "trigger" | "buildIncreaseAmount" | "lock",
        public title: string,
        public cost: Conversion,
        public transform?: string
    ) {

    }
}

export function module(id: string) {
    return new ModuleArguments().id(id)
}

//The module is what the base interface which interacts with the planet.
export class Module {
    uiComponent?: UIComponent
    //Event handler which is triggered when the transform method is complete.
    onTransform = new EventHandler<Module>()
    //Called when this is unlocked
    onUnlock = new EventHandler<Module>()
    //Modifier handler which allows accessing and setting modifiers at different points.
    modifiers = new ModifierHandler<number | string>()
    //Transform ID used for saving
    transformID?: string
    //History of transforms used for saving
    transformHistory: string[] = []
    //is true when this module is disabled, meaning it won't unlock again.
    disabled: boolean = false

    constructor(
        public items: Items,
        public id: string,
        public name: string,
        public description: string,
        public conversions: Conversion[],
        public transforms: Map<string, ModuleArguments>, //A map of module arguments which can be completed and overwrite this module.
        public buttons: ModuleButton[] = [],
        public unlockConditions: UnlockCondition[] = [],
        public unlocked: boolean = true,
        public lineID: string, //ID of the line this is a child of
        public lockIDs?: string[]
    ) {
        if (unlockConditions.length > 0) this.unlocked = false
    }

    //Called on each activation cycle
    activate() {
        if (!this.disabled) {
            //Check the unlock conditions. If all succeed this module will be unlocked.
            if (!this.unlocked && this.unlockConditions.length > 0) {
                this.checkUnlocks()
            }

            //Don't check the conversions of a locked Module
            if (this.unlocked) {
                if (this.transforms.size > 0) {

                    this.transforms.forEach(trans => {

                        if (trans._unlockConditions.length > 0) {
                            var allTrue = true
                            trans._unlockConditions.forEach((uC) => {
                                if (!uC.check()) allTrue = false
                            })
                            if (allTrue && trans._id) this.transform(trans._id)
                        }
                    })

                }
                //Check the conversions, which will consume/output resources
                this.conversions.forEach(con => {
                    con.checkConversion()
                })
            }
        }
    }

    checkUnlocks() {

        var allTrue = true
        this.unlockConditions.forEach((uC) => {
            if (uC.check() === false) allTrue = false
        })
        if (allTrue) {
            this.unlock()
            this.onUnlock.trigger(this)
        }
    }

    unlock(loading?: boolean) {
        this.unlocked = true
        this.uiComponent?.show()
        const lineUI = $(`#${this.lineID}`).show()
        //If this module is being loaded, don't add the new module marker to the line ui
        if (!loading) {

            lineUI.find(`.unlock-marker`)
                .show()
        }

        if (this.lockIDs) {
            this.lockIDs.forEach(id => {
                const module = game.currentPlanet().modules.get(id)
                if (module) module.disable()
                else console.warn(`Could not find module ${id} to lock after unlocked ${this.id}`)
            })
        }
    }

    lock() {
        this.unlocked = false
        this.uiComponent?.hide()
    }

    disable() {
        this.disabled = false
        this.uiComponent?.hide()
    }

    //Transform this module using a set of module arguments.
    transform(transformID: string) {
        //Attempt to get the transform from the transforms map.
        const transform = this.transforms.get(transformID)?.complete()(this.items, this.lineID)

        //Check that it pulls one that exists.
        if (transform) {
            this.transformID = transformID
            this.transformHistory.push(transformID)
            const { onTransform, id, transformHistory, ...transformExcluded } = transform
            Object.assign(this, transformExcluded)
            this.onTransform.trigger(this)
        }
        else console.warn(`Could not find transform ${transformID} on module ${this.id}`)

    }
}

export class ModuleExporter {
    constructor(public id: string, public name: string, public modArray: ((items: Items, lineID: string) => Module)[]) { }
}

