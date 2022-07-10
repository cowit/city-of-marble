import { EventHandler } from "../components/events.js"
import { ModifiableVariable, ModifierReference } from "../modifiers.js"
import { Module } from "../module.js"
import { itemIcon } from "../ui.js"

class ItemEvent {
    constructor(public newAmount: number, public item: Item) { }
}

export class Item {
    //Main Variables
    public _amount = 0
    public capacity = 0
    public amountChange = {
        current: 0,
        next: 0
    }
    protected capacities = new Map<string, Capacity>()
    public module?: Module
    public unlocked = false

    //Events
    public onAmountChange = new EventHandler<ItemEvent>()
    public onTotalChange = new EventHandler<ItemEvent>()
    public onModifierChange = new EventHandler<ItemEvent>()
    public onActivation = new EventHandler<ItemEvent>()
    public onUnlockToggle = new EventHandler<boolean>()
    protected events = new Map<string, EventHandler<ItemEvent>>()
        .set(`amountChange`, this.onAmountChange)
        .set(`totalChange`, this.onTotalChange)
        .set(`modifierChange`, this.onModifierChange)
        .set(`activation`, this.onActivation)

    constructor(public id: string, public name: string, public icon: string) { }

    lock() {
        this.unlocked = false
        this.onUnlockToggle.trigger(this.unlocked)
    }

    unlock() {
        this.unlocked = true
        this.onUnlockToggle.trigger(this.unlocked)
    }

    activate() {
        this.amountChange.current = this.amountChange.next
        this.amountChange.next = 0
        this.trigger(`activation`)
    }

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
        this.unlock()
        //If the capacity is set to 0, uncap it. Otherwise cap it.
        if (this.capacities.size !== 0) newAmount = Math.min(this.capacity, newAmount)
        this._amount = newAmount

        //When the amount changes, call the amountChange event for all listeners.
        this.onAmountChange.trigger(new ItemEvent(this._amount, this))
        return this
    }

    add(addend: number) {
        this.amount(this._amount + addend)
        this.amountChange.next += addend
        return this
    }

    on(eventType: "amountChange" | "totalChange" | "modifierChange" | "activation", callback: ((event: ItemEvent) => void)) {
        var eventArray = this.events.get(eventType)
        if (!eventArray) console.error(`Event type ${eventType} does not exist.`)
        else eventArray.listen(callback)
    }

    trigger(eventType: "amountChange" | "totalChange" | "modifierChange" | "activation") {
        this.events.get(eventType)?.trigger(new ItemEvent(this._amount, this))
    }

    addCapacity(capItem: Item, multiplier: number = 1) {
        this.capacities.set(capItem.id, new Capacity(this, capItem, multiplier))
        return this
    }
}

export class ItemRef extends Item {
    totalVar?: ModifiableVariable<number>
    constructor(public item: Item, refAmount: number, public modifiers?: ModifierReference[], public dontConsume: boolean = false) {
        super(item.id, item.name, item.icon)
        this._amount = refAmount
        if (modifiers && modifiers.length > 0) {
            modifiers.forEach((mod) => {
                if (typeof this._amount === "number") {
                    if (this.totalVar) {
                        this.totalVar = game.currentPlanet().globalModifiers.subscribe(mod, this.totalVar) as ModifiableVariable<number>
                    }
                    else {
                        this.totalVar = game.currentPlanet().globalModifiers.subscribe(mod, this._amount) as ModifiableVariable<number>
                    }
                }

            })

            this.totalVar?.onModifierChange.listen(() => {
                //Called when a modifier is changed
                this.onModifierChange.trigger(new ItemEvent(this.total(), this))
                //Call as well to update the UI and anything else needed.
                this.onAmountChange.trigger(new ItemEvent(this.total(), this))
            })
        }
    }

    total(): number {
        if (this.totalVar) {
            return this.totalVar.totalNumber
        }
        else return this._amount
    }


}

class Capacity {
    amount = 0
    constructor(public item: Item, public capItem: Item, public multiplier: number) {
        capItem.on("amountChange", (e) => {
            //Get the difference between the new and old amount
            const changeBy = this.amount - e.newAmount * multiplier
            //Change the stored amount and the total amount.
            this.amount -= changeBy
            item.capacity -= changeBy
        })
    }
}


function itemAccessor(id: string, name: string) {
    //Create the Item
    const item = new Item(id, name, "./built/items/item-icons/" + id + ".svg")

    //Create all the item-display divs on the storage bar.
    if ($(`#${id}-display`).length === 0) {
        itemIcon(item, $(".items-display"))
    }

    //Quick access function which allows to quickly get the Item or an Itemref using a number.
    function quickAccess(): Item
    function quickAccess(refAmount?: number, modifiers?: ModifierReference[], dontConsume?: boolean): ItemRef
    function quickAccess(refAmount?: number, modifiers?: ModifierReference[], dontConsume: boolean = false): Item | ItemRef {
        if (refAmount !== undefined) {
            return new ItemRef(item, refAmount, modifiers, dontConsume)
        }
        else return item
    }
    return quickAccess
}

export class Items {
    food = itemAccessor("food", "Food")
    housing = itemAccessor("housing", "Housing")
    population = itemAccessor("population", "Population")
    labor = itemAccessor("labor", "Labor")
    unexploredLand = itemAccessor("unexploredLand", "Unexplored Land")
    land = itemAccessor("land", "Land")
    localWater = itemAccessor("localWater", "Local Water")
    wood = itemAccessor("wood", "Wood")
    metalOre = itemAccessor("metalOre", "Metal Ore")
    metal = itemAccessor("metal", "Metal")
    stone = itemAccessor("stone", "Stone")
    temple = itemAccessor(`temple`, `Temple Progress`)
    diplomaticFavor = itemAccessor(`diplomaticFavor`, `Diplomatic Favor`)

    constructor() {
        this.population().addCapacity(this.housing(), 5)
        this.labor().addCapacity(this.population(), 5)
    }
}

