export class Stat {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this._amount = 0;
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
        this._amount = newAmount;
        return this;
    }
    add(addend) {
        this._amount += addend;
        return this;
    }
}
//# sourceMappingURL=stats.js.map