import { itemIcon } from "../ui.js"

export class Item {
    //Main Variables
    protected _amount: number = 0
    public capacity: number = 0
    protected capacities = new Map<string, Capacity>()
    //protected modifiers = new Map<string, ((items: Items) => void)>()

    //Events
    private listeners = new Map<string, ((newAmount: number, item: Item) => void)[]>()

    constructor(public id: string, public name: string, public icon: string) { }

    /*
    activate(items: Items) {
        this.modifiers.forEach(mod => {
            mod(items)
        })
    }
*/
    checkAmount(divisor?: number) {
        //If a divisor is passed, divide the number by that amount. Else return the amount.
        if (divisor) {
            return this._amount / Math.abs(divisor)
        }
        else return this._amount
    }

    total() {
        return this._amount
    }

    amount(newAmount: number) {
        //If the capacity is set to 0, uncap it. Otherwise cap it.
        if (this.capacities.size !== 0) newAmount = Math.min(this.capacity, newAmount)
        this._amount = newAmount
        //When the amount changes, call the amountChange event for all listeners.
        this.listeners.get("amountChange")?.forEach((callback) => {
            callback(this._amount, this)
        })
        return this
    }

    add(addend: number) {
        this.amount(this._amount + addend)
        return this
    }

    on(eventType: "amountChange", callback: ((newAmount: number, item: Item) => void)) {
        var eventArray = this.listeners.get(eventType)
        if (!eventArray) this.listeners.set(eventType, [callback])
        else eventArray.push(callback)
    }

    /*
    addModifier(modName: string, mod: ((items: Items) => void)) {
        this.modifiers.set(modName, mod)
    }
    */

    addCapacity(capItem: Item, multiplier: number = 1) {
        this.capacities.set(capItem.id, new Capacity(this, capItem, multiplier))
        return this
    }
}

export class ItemRef extends Item {
    constructor(public item: Item, refAmount: number) {
        super(item.id, item.name, item.icon)
        this._amount = refAmount
    }
}

class Capacity {
    amount = 0
    constructor(public item: Item, public capItem: Item, public multiplier: number) {
        capItem.on("amountChange", (newAmount) => {
            //Get the difference between the new and old amount
            const changeBy = this.amount - newAmount * multiplier
            //Change the stored amount and the total amount.
            this.amount -= changeBy
            item.capacity -= changeBy
        })
    }
}


function itemAccessor(id: string, name: string) {
    //Create the Item
    const item = new Item(id, name, "./items/item-icons/" + id + ".svg")

    //Create all the item-display divs on the storage bar.
    if ($(`#${id}-display`).length === 0) {
        itemIcon(item, $(".items-display"))
    }

    //Quick access function which allows to quickly get the Item or an Itemref using a number.
    function quickAccess(): Item
    function quickAccess(refAmount?: number): ItemRef
    function quickAccess(refAmount?: number): Item | ItemRef {
        if (refAmount) {
            return new ItemRef(item, refAmount)
        }
        else return item
    }
    return quickAccess
}

export class Items {
    food = itemAccessor("food", "Food")
    housing = itemAccessor("housing", "Housing")
    population = itemAccessor("population", "Population")
    workForce = itemAccessor("workForce", "Work Force")
    unexploredLand =itemAccessor("unexploredLand", "Unexplored Land")
    land = itemAccessor("land", "Land")

    constructor() {
        this.housing().addCapacity(this.land())
        this.population().addCapacity(this.housing(), 5)
        this.workForce().addCapacity(this.population())
    }
}

