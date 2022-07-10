import { EventHandler } from "./components/events.js"
import { Total } from "./data/interfaces.js"

export function modi(id: string, multiplier: number = 1) { return new ModifierReference(id, multiplier) }

export class ModifierReference {
    constructor(
        public id: string,
        public multiplier: number
    ) { }
}

export class ModifiableVariable<variableType> implements Total<number | variableType> {
    value: number | variableType = 0
    totalNumber: number = 0
    onModifierChange = new EventHandler<number | string>()
    constructor(
        public parent: ModifierCollection<variableType>,
        public original: variableType
    ) {
        this.value = original
        if (typeof original === "number") this.totalNumber = original
    }

    total() {
        if (typeof this.value === "number") return this.totalNumber
        else return this.value
    }
}

export class ModifierHandler<modifierType> {
    public modifiers = new Map<string, ModifierCollection<modifierType>>()

    set(modifierID: string, owner: string, value: modifierType, increment?: boolean) {
        var mods = this.modifiers.get(modifierID)

        if (!mods) {
            mods = new ModifierCollection<modifierType>(this)
            this.modifiers.set(modifierID, mods)
        }
        var mod = mods.get(owner)
        if (!mod) {
            mod = new Modifier<modifierType>(value)
        }
        //An incrementer option, which simply increments instead of setting the modifier value.
        else if (increment && typeof value === "number" && typeof mod.value === "number") (mod.value as number) = value + mod.value
        else mod.value = value
        mods.set(owner, mod)
    }

    subscribe(modifierRef: ModifierReference, original: modifierType | ModifiableVariable<modifierType>) {
        var mods = this.modifiers.get(modifierRef.id)
        //If the list does not exist, create a new one and return undefined.
        if (!mods) {
            mods = new ModifierCollection<modifierType>(this)
            this.modifiers.set(modifierRef.id, mods)
        }

        //Return a modifierVariable which will keep it's amount updated with the modifier.
        return mods.subscribe(original, modifierRef)
    }
}

export class ModifierCollection<modifierType> {
    public collection = new Map<string, Modifier<modifierType>>()
    private modVariables = new EventHandler<[number, number, modifierType?]>()
    private total: [number, number, modifierType?] = [0, 0]

    constructor(public parent: ModifierHandler<modifierType>) { }

    get(ownerID: string) {
        return this.collection.get(ownerID)
    }

    set(key: string, mod: Modifier<modifierType>) {
        this.collection.set(key, mod)
        if (typeof mod.value === "number") {
            this.total[1] = this.total[0] - mod.value
            this.total[0] -= this.total[1]
        }
        this.total[2] = mod.value
        this.modVariables.trigger(this.total)
    }

    subscribe(original: modifierType | ModifiableVariable<modifierType>, modifierRef: ModifierReference) {
        if (original instanceof ModifiableVariable) {
            this.modVariables.listen(() => {
                original.totalNumber -= this.total[1] * modifierRef.multiplier
                original.value = this.total[2] || 0
                original.onModifierChange.trigger(original.totalNumber)

            })
            return original
        }
        else {
            const modVar = new ModifiableVariable<modifierType>(this, original)
            modVar.totalNumber -= this.total[1]
            modVar.value = this.total[2] || 0
            this.modVariables.listen(() => {
                modVar.totalNumber -= this.total[1] * modifierRef.multiplier
                modVar.value = this.total[2] || 0

                modVar.onModifierChange.trigger(modVar.totalNumber)
            })
            return modVar
        }
    }
}

export class Modifier<modifierType> {
    constructor(public value: modifierType) { }
}


//Consumers, something which accesses and uses the modifier
//ex: An itemref which uses the foodBase modifier to increase the food produced by it's value
//Producers, something which applies the value to the modifier/adds new ones.
//ex: a button which adds a modifier/value to the modifiers.
//Modifier, an object which stores the value.