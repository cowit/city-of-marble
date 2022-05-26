import { ItemRef } from "./items/items"

export class ConversionArguments {
    private _inputs: ItemRef[] = []
    private _outputs: ItemRef[] = []
    private _onFinish?: Function

    inputs(inputs: ItemRef[]) {
        this._inputs = inputs
        return this
    }
    outputs(outputs: ItemRef[]) {
        this._outputs = outputs
        return this
    }
    onFinish(onFinish: Function) {
        this._onFinish = onFinish
        return this
    }

    complete() {
        return new Conversion(this._inputs, this._outputs, this._onFinish)
    }
}

export function conversion() {
    return new ConversionArguments()
}

export class Conversion {
    amount: number = 1
    constructor(
        public inputs: ItemRef[],
        public outputs: ItemRef[],
        public onFinish?: Function
    ) { }

    checkConversion(complete?: (() => void)) {
        //The maximum amount of conversion activations that can happen.
        let maxConversions: number = this.amount
        //Reduce maxConversions to the input that can make the fewest activations.
        this.inputs.forEach(inp => {
            maxConversions = Math.floor(Math.min(inp.item.checkAmount(inp.total()), maxConversions))
        })
        //If there is more than 0 conversions, activate the outputs multiplied by the max conversions.
        if (maxConversions >= 1) {
            //Iterate through the outputs and add the amount to the stat
            this.outputs.forEach(out => {
                out.item.add(out.total() * maxConversions)
            })

            this.inputs.forEach(inp => {
                inp.item.add(-(inp.total() * maxConversions))
            })

            if (this.onFinish) this.onFinish()
            if (complete) complete()
        }
    }
}

