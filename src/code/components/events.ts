export class EventHandler<dataType> {
    //Listeners
    private listeners: ((data?: dataType) => void)[] = []

    trigger(data?: dataType) {
        this.listeners.forEach((lis) => {
            lis(data)
        })
    }

    listen(lis: ((data?: dataType) => void)) {
        this.listeners.push(lis)
    }
}