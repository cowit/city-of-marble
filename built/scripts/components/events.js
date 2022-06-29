export class EventHandler {
    constructor() {
        //Listeners
        this.listeners = [];
    }
    trigger(data) {
        this.listeners.forEach((lis) => {
            lis(data);
        });
    }
    listen(lis) {
        this.listeners.push(lis);
    }
}
//# sourceMappingURL=events.js.map