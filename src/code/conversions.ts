import { ItemRef } from "./data/items"

type conversionProperty = "amount" | "completions"

export class modifierSelector {
    constructor(public value: conversionProperty | number, public modifierID: string) { }
}

export class ConversionArguments {
    private _inputs: ItemRef[] = []
    private _outputs: ItemRef[] = []
    private _modifierSelectors: modifierSelector[] = []
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
    modifier(value: conversionProperty | number, modifierID: string) {
        this._modifierSelectors.push(new modifierSelector(value, modifierID))
        return this
    }

    complete() {
        return new Conversion(this._inputs, this._outputs, this._modifierSelectors, this._onFinish)
    }
}

export function conversion() {
    return new ConversionArguments()
}

export class Conversion {
    amount: number = 1
    completions = 0
    constructor(
        public inputs: ItemRef[],
        public outputs: ItemRef[],
        public modifierSelectors: modifierSelector[],
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
            this.completions++
            //Iterate through the outputs and add the amount to the stat
            this.outputs.forEach(out => {
                out.item.add(out.total() * maxConversions)
            })

            this.inputs.forEach(inp => {
                //Check if dontConsume is false. If it is true, don't consume the item ref amount.
                if(!inp.dontConsume)inp.item.add(-(inp.total() * maxConversions))
            })

            if (this.onFinish) this.onFinish()
            if (complete) complete()

            if (this.modifierSelectors.length > 0) {
                this.modifierSelectors.forEach((mS) => {
                    //If the value selector is amount, replace it with the amount of this conversion.
                    if (mS.value === "amount") {
                        
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, this.amount)
                    }
                    else if (mS.value === "completions") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, this.completions)
                    }
                    else if (typeof mS.value === "number") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, mS.value)
                    }
                })
            }
        }
    }
}

