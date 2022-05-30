import { EventHandler } from "../components/events.js";
import { itemIcon } from "../ui.js";
class ItemEvent {
    constructor(newAmount, item) {
        this.newAmount = newAmount;
        this.item = item;
    }
}
export class Item {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        //Main Variables
        this._amount = 0;
        this.capacity = 0;
        this.capacities = new Map();
        this.unlocked = true;
        //Events
        this.onAmountChange = new EventHandler();
        this.onTotalChange = new EventHandler();
        this.onModifierChange = new EventHandler();
        this.events = new Map()
            .set(`amountChange`, this.onAmountChange)
            .set(`totalChange`, this.onTotalChange)
            .set(`modifierChange`, this.onModifierChange);
    }
    checkAmount(divisor) {
        //If a divisor is passed, divide the number by that amount. Else return the amount.
        if (divisor) {
            return this._amount / Math.abs(divisor);
        }
        else
            return this._amount;
    }
    total() {
        return this._amount;
    }
    amount(newAmount) {
        //If the capacity is set to 0, uncap it. Otherwise cap it.
        if (this.capacities.size !== 0)
            newAmount = Math.min(this.capacity, newAmount);
        this._amount = newAmount;
        //When the amount changes, call the amountChange event for all listeners.
        this.onAmountChange.trigger(new ItemEvent(this._amount, this));
        return this;
    }
    add(addend) {
        this.amount(this._amount + addend);
        return this;
    }
    on(eventType, callback) {
        var eventArray = this.events.get(eventType);
        if (!eventArray)
            console.error(`Event type ${eventType} does not exist.`);
        else
            eventArray.listen(callback);
    }
    trigger(eventType) {
        var _a;
        (_a = this.events.get(eventType)) === null || _a === void 0 ? void 0 : _a.trigger(new ItemEvent(this._amount, this));
    }
    addCapacity(capItem, multiplier = 1) {
        this.capacities.set(capItem.id, new Capacity(this, capItem, multiplier));
        return this;
    }
}
export class ItemRef extends Item {
    constructor(item, refAmount, modifiers, dontConsume = false) {
        var _a;
        super(item.id, item.name, item.icon);
        this.item = item;
        this.modifiers = modifiers;
        this.dontConsume = dontConsume;
        this._amount = refAmount;
        if (modifiers && modifiers.length > 0) {
            modifiers.forEach((mod) => {
                this.totalVar = game.currentPlanet().globalModifiers.subscribe(mod, this._amount);
            });
            (_a = this.totalVar) === null || _a === void 0 ? void 0 : _a.onModifierChange.listen(() => {
                //Called when a modifier is changed
                this.onModifierChange.trigger(new ItemEvent(this.total(), this));
                //Call as well to update the UI and anything else needed.
                this.onAmountChange.trigger(new ItemEvent(this.total(), this));
            });
        }
    }
    total() {
        if (this.totalVar) {
            return this.totalVar.totalNumber;
        }
        else
            return this._amount;
    }
}
class Capacity {
    constructor(item, capItem, multiplier) {
        this.item = item;
        this.capItem = capItem;
        this.multiplier = multiplier;
        this.amount = 0;
        capItem.on("amountChange", (e) => {
            //Get the difference between the new and old amount
            const changeBy = this.amount - e.newAmount * multiplier;
            //Change the stored amount and the total amount.
            this.amount -= changeBy;
            item.capacity -= changeBy;
        });
    }
}
function itemAccessor(id, name) {
    //Create the Item
    const item = new Item(id, name, "./items/item-icons/" + id + ".svg");
    //Create all the item-display divs on the storage bar.
    if ($(`#${id}-display`).length === 0) {
        itemIcon(item, $(".items-display"));
    }
    function quickAccess(refAmount, modifiers, dontConsume = false) {
        if (refAmount !== undefined) {
            return new ItemRef(item, refAmount, modifiers, dontConsume);
        }
        else
            return item;
    }
    return quickAccess;
}
export class Items {
    constructor() {
        this.food = itemAccessor("food", "Food");
        this.housing = itemAccessor("housing", "Housing");
        this.population = itemAccessor("population", "Population");
        this.workForce = itemAccessor("workForce", "Work Force");
        this.unexploredLand = itemAccessor("unexploredLand", "Unexplored Land");
        this.land = itemAccessor("land", "Land");
        this.localWater = itemAccessor("localWater", "Local Water");
        this.wood = itemAccessor("wood", "Wood");
        this.metalOre = itemAccessor("metalOre", "Metal Ore");
        this.metal = itemAccessor("metal", "Metal");
        this.stone = itemAccessor("stone", "Stone");
        this.population().addCapacity(this.housing(), 5);
        this.workForce().addCapacity(this.population());
    }
}
//# sourceMappingURL=items.js.map