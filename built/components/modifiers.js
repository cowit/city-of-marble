import { EventHandler } from "./events.js";
export class ModifiableVariable {
    constructor(original) {
        this.original = original;
        this.totalNumber = 0;
        this.onModifierChange = new EventHandler();
        this.total = original;
        if (typeof original === "number")
            this.totalNumber = original;
    }
}
export class ModifierHandler {
    constructor() {
        this.modifiers = new Map();
    }
    set(modifierID, owner, value) {
        var mods = this.modifiers.get(modifierID);
        if (!mods) {
            mods = new ModifierCollection();
            this.modifiers.set(modifierID, mods);
        }
        var mod = mods.get(owner);
        if (!mod) {
            mod = new Modifier(value);
        }
        mod.value = value;
        mods.set(owner, mod);
    }
    subscribe(modifierID, original) {
        var mods = this.modifiers.get(modifierID);
        //If the list does not exist, create a new one and return undefined.
        if (!mods) {
            mods = new ModifierCollection();
            this.modifiers.set(modifierID, mods);
        }
        //Return a modifierVariable which will keep it's amount updated with the modifier.
        return mods.subscribe(original);
    }
}
export class ModifierCollection {
    constructor() {
        this.collection = new Map();
        this.modVariables = new EventHandler();
        this.total = [0, 0];
    }
    get(ownerID) {
        return this.collection.get(ownerID);
    }
    set(key, mod) {
        this.collection.set(key, mod);
        if (typeof mod.value === "number") {
            this.total[1] = this.total[0] - mod.value;
            this.total[0] -= this.total[1];
        }
        this.total[2] = mod.value;
        this.modVariables.trigger();
    }
    subscribe(original) {
        if (original instanceof ModifiableVariable) {
            this.modVariables.listen(() => {
                original.totalNumber -= this.total[1];
                original.total = this.total[2];
                original.onModifierChange.trigger();
            });
            return original;
        }
        else {
            const modVar = new ModifiableVariable(original);
            modVar.totalNumber -= this.total[1];
            modVar.total = this.total[2];
            this.modVariables.listen(() => {
                modVar.totalNumber -= this.total[1];
                modVar.total = this.total[2];
                modVar.onModifierChange.trigger();
            });
            return modVar;
        }
    }
}
export class Modifier {
    constructor(value) {
        this.value = value;
    }
}
//Consumers, something which accesses and uses the modifier
//ex: An itemref which uses the foodBase modifier to increase the food produced by it's value
//Producers, something which applies the value to the modifier/adds new ones.
//ex: a button which adds a modifier/value to the modifiers.
//Modifier, an object which stores the value.
//# sourceMappingURL=modifiers.js.map