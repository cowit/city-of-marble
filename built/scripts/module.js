import { EventHandler } from "./components/events.js";
import { ModifiableVariable, ModifierHandler, ModifierReference } from "./modifiers.js";
import { Item } from "./data/items.js";
export function unlock(target, operator, condition) {
    return new UnlockCondition(target, operator, condition);
}
export class UnlockCondition {
    constructor(target, operator, condition) {
        this.target = target;
        this.operator = operator;
        this.condition = condition;
        if (target instanceof ModifierReference) {
            this.target = game.currentPlanet().globalModifiers.subscribe(target, 0);
        }
    }
    check() {
        if (typeof this.condition === "string" || this.operator === "equals") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.value === this.condition;
            }
            else if (this.target instanceof Item) {
                return this.target.total() === this.condition;
            }
        }
        else if (this.operator === "less") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber < this.condition;
            }
            else if (this.target instanceof Item) {
                return this.target.total() < this.condition;
            }
        }
        else if (this.operator === "more") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber > this.condition;
            }
            else if (this.target instanceof Item) {
                return this.target.total() > this.condition;
            }
        }
        else if (this.operator === "atleast") {
            if (this.target instanceof ModifiableVariable) {
                return this.target.totalNumber >= this.condition;
            }
            else if (this.target instanceof Item) {
                return this.target.total() >= this.condition;
            }
        }
        else
            throw new Error(`No Targets where compatible in this unlock condition.`);
    }
}
export class ModuleArguments {
    constructor() {
        this._conversions = [];
        this._buttons = [];
        this._description = "";
        this._unlockConditions = [];
        this._lockIDs = [];
    }
    id(id) {
        this._id = id;
        return this;
    }
    name(name) {
        this._name = name;
        return this;
    }
    description(description) {
        this._description = description;
        return this;
    }
    conversions(conversions) {
        this._conversions = conversions;
        return this;
    }
    button(type, title, cost) {
        cost.build();
        this._buttons.push(new ModuleButton(type, title, cost));
        return this;
    }
    unlockConditions(conditions, lockIDs) {
        this._unlockConditions = conditions;
        if (lockIDs)
            this._lockIDs = lockIDs;
        return this;
    }
    complete() {
        const mod = (items, lineID) => {
            if (!this._id)
                throw new Error(`A Module Does not have an ID assigned to it.`);
            if (!this._name)
                throw new Error(`Module ${this._id} does not have a Name assigned to it.`);
            const module = new Module(items, this._id, this._name, this._description, this._conversions, this._buttons, this._unlockConditions, true, lineID, this._lockIDs);
            //Inject the module into all items/itemrefs so that they can use it's modifiers.
            module.conversions.forEach(con => {
                con.inputs.forEach(inp => { inp.module = module; });
                con.outputs.forEach(out => { out.module = module; });
            });
            return module;
        };
        return mod.bind(this);
    }
}
export class ModuleButton {
    constructor(type, title, cost) {
        this.type = type;
        this.title = title;
        this.cost = cost;
    }
}
export function module(id) {
    return new ModuleArguments().id(id);
}
//The module is what the base interface which interacts with the planet.
export class Module {
    constructor(items, id, name, description, conversions, buttons = [], unlockConditions = [], unlocked = true, lineID, //ID of the line this is a child of
    lockIDs) {
        this.items = items;
        this.id = id;
        this.name = name;
        this.description = description;
        this.conversions = conversions;
        this.buttons = buttons;
        this.unlockConditions = unlockConditions;
        this.unlocked = unlocked;
        this.lineID = lineID;
        this.lockIDs = lockIDs;
        //Called when this is unlocked
        this.onUnlock = new EventHandler();
        //Modifier handler which allows accessing and setting modifiers at different points.
        this.modifiers = new ModifierHandler();
        //is true when this module is disabled, meaning it won't unlock again.
        this.disabled = false;
        if (unlockConditions.length > 0)
            this.unlocked = false;
    }
    //Called on each activation cycle
    activate() {
        if (!this.disabled) {
            //Check the unlock conditions. If all succeed this module will be unlocked.
            if (!this.unlocked && this.unlockConditions.length > 0) {
                this.checkUnlocks();
            }
            //Don't check the conversions of a locked Module
            if (this.unlocked) {
                //Check the conversions, which will consume/output resources
                this.conversions.forEach(con => {
                    con.checkConversion();
                });
            }
        }
    }
    checkUnlocks() {
        var allTrue = true;
        this.unlockConditions.forEach((uC) => {
            if (uC.check() === false)
                allTrue = false;
        });
        if (allTrue) {
            this.unlock();
            this.onUnlock.trigger(this);
        }
    }
    unlock(loading) {
        var _a;
        this.unlocked = true;
        (_a = this.uiComponent) === null || _a === void 0 ? void 0 : _a.show();
        const lineUI = $(`#${this.lineID}`).show();
        //If this module is being loaded, don't add the new module marker to the line ui
        if (!loading) {
            lineUI.find(`.unlock-marker`)
                .show();
        }
        if (this.lockIDs) {
            this.lockIDs.forEach(id => {
                const module = game.currentPlanet().modules.get(id);
                if (module)
                    module.disable();
                else
                    console.warn(`Could not find module ${id} to lock after unlocked ${this.id}`);
            });
        }
    }
    lock() {
        var _a;
        this.unlocked = false;
        (_a = this.uiComponent) === null || _a === void 0 ? void 0 : _a.hide();
    }
    disable() {
        var _a;
        this.disabled = false;
        (_a = this.uiComponent) === null || _a === void 0 ? void 0 : _a.hide();
    }
}
export class ModuleExporter {
    constructor(id, name, modArray) {
        this.id = id;
        this.name = name;
        this.modArray = modArray;
    }
}
//# sourceMappingURL=module.js.map