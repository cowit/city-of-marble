import { EventHandler } from "./components/events.js";
import { ModifiableVariable, ModifierHandler, ModifierReference } from "./modifiers.js";
import { conversion, Conversion } from "./conversions.js";
import { Item, ItemRef, Items } from "./data/items.js";
import { ModuleHandler } from "./module-handler.js";
import { UIComponent } from "./ui.js";

export function unlock(target: ModifierReference | Item, operator: `more` | `less` | `equals` | `atleast`, condition: number) {
    return new UnlockCondition(target, operator, condition)
}

export class UnlockCondition {
    constructor(
        public target: ModifierReference | Item | ModifiableVariable<number>,
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
                return this.target.value === this.condition
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

    button(type: "build" | "trigger" | "buildIncreaseAmount" | "lock", title: string, cost: Conversion) {
        cost.build()

        this._buttons.push(new ModuleButton(type, title, cost))
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
                this._conversions,
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
        public cost: Conversion
    ) {

    }
}

export function module(id: string) {
    return new ModuleArguments().id(id)
}

//The module is what the base interface which interacts with the planet.
export class Module {
    uiComponent?: UIComponent
    //Called when this is unlocked
    onUnlock = new EventHandler<Module>()
    //Modifier handler which allows accessing and setting modifiers at different points.
    modifiers = new ModifierHandler<number | string>()
    //is true when this module is disabled, meaning it won't unlock again.
    disabled: boolean = false

    constructor(
        public items: Items,
        public id: string,
        public name: string,
        public description: string,
        public conversions: Conversion[],
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
}

export class ModuleExporter {
    constructor(public id: string, public name: string, public modArray: ((items: Items, lineID: string) => Module)[]) { }
}

