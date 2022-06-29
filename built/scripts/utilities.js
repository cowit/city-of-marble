export class ItemRef {
    constructor(item, amount) {
        this.item = item;
        this.amount = amount;
    }
    total() { return this.amount; }
    icon() { return this.item.icon; }
}
//# sourceMappingURL=utilities.js.map