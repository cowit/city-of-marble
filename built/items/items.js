import { itemIcon } from "../ui.js";
export class Item {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        //Main Variables
        this._amount = 0;
        this.capacity = 0;
        this.capacities = new Map();
        //protected modifiers = new Map<string, ((items: Items) => void)>()
        //Events
        this.listeners = new Map();
    }
    /*
    activate(items: Items) {
        this.modifiers.forEach(mod => {
            mod(items)
        })
    }
*/
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
        var _a;
        //If the capacity is set to 0, uncap it. Otherwise cap it.
        if (this.capacities.size !== 0)
            newAmount = Math.min(this.capacity, newAmount);
        this._amount = newAmount;
        //When the amount changes, call the amountChange event for all listeners.
        (_a = this.listeners.get("amountChange")) === null || _a === void 0 ? void 0 : _a.forEach((callback) => {
            callback(this._amount, this);
        });
        return this;
    }
    add(addend) {
        this.amount(this._amount + addend);
        return this;
    }
    on(eventType, callback) {
        var eventArray = this.listeners.get(eventType);
        if (!eventArray)
            this.listeners.set(eventType, [callback]);
        else
            eventArray.push(callback);
    }
    /*
    addModifier(modName: string, mod: ((items: Items) => void)) {
        this.modifiers.set(modName, mod)
    }
    */
    addCapacity(capItem, multiplier = 1) {
        this.capacities.set(capItem.id, new Capacity(this, capItem, multiplier));
        return this;
    }
}
export class ItemRef extends Item {
    constructor(item, refAmount) {
        super(item.id, item.name, item.icon);
        this.item = item;
        this._amount = refAmount;
    }
}
class Capacity {
    constructor(item, capItem, multiplier) {
        this.item = item;
        this.capItem = capItem;
        this.multiplier = multiplier;
        this.amount = 0;
        capItem.on("amountChange", (newAmount) => {
            //Get the difference between the new and old amount
            const changeBy = this.amount - newAmount * multiplier;
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
    function quickAccess(refAmount) {
        if (refAmount) {
            return new ItemRef(item, refAmount);
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
        this.housing().addCapacity(this.land());
        this.population().addCapacity(this.housing(), 5);
        this.workForce().addCapacity(this.population());
    }
}
//# sourceMappingURL=items.js.map