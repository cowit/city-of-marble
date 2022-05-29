import { EventHandler } from "./components/events.js"
import { ItemRef } from "./data/items.js"

type conversionProperty = "amount" | "completions" | "current"

export class modifierSelector {
    constructor(public value: conversionProperty | number, public modifierID: string) { }
}

export class ConversionArguments {
    private _inputs: ItemRef[] = []
    private _outputs: ItemRef[] = []
    private _modifierSelectors: modifierSelector[] = []
    private _onFinish?: Function
    private _amount?: number
    private _id?: string

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
    amount(value: number) {
        this._amount = value
        return this
    }
    id(id: string) {
        this._id = id
        return this
    }

    complete() {
        if (!this._id) {
            console.error(`No ID found for conversion. `, this)
            throw new Error(`No ID given.`)
        }
        const con = new Conversion(
            this._id,
            this._inputs,
            this._outputs,
            this._modifierSelectors,
            this._onFinish,
            this._amount
        )
        game.currentPlanet().conversions.set(this._id, con)
        return con
    }
}

export function conversion(id: string) {
    const conArg = new ConversionArguments()
    conArg.id(id)
    return conArg
}

export class Conversion {
    amount = 0
    current = 0
    completions = 0
    onAmountChange = new EventHandler<Conversion>()
    constructor(
        public id: string,
        public inputs: ItemRef[],
        public outputs: ItemRef[],
        public modifierSelectors: modifierSelector[],
        public onFinish?: Function,
        amount = 0
    ) {
        this.build(amount)
    }

    checkConversion(complete?: (() => void)) {
        //The maximum amount of conversion activations that can happen.
        let maxConversions: number = this.amount
        //Reduce maxConversions to the input that can make the fewest activations.
        this.inputs.forEach(inp => {
            if (inp.total() > 0) {
                maxConversions = Math.floor(Math.min(inp.item.checkAmount(inp.total()), maxConversions))
            }
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
                if (!inp.dontConsume) inp.item.add(-(inp.total() * maxConversions))
            })

            if (this.onFinish) this.onFinish()
            if (complete) complete()

            if (this.modifierSelectors.length > 0) {
                this.modifierSelectors.forEach((mS) => {
                    //If the value selector is amount, replace it with the amount of this conversion.
                    if (mS.value === "amount") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.amount)
                    }
                    else if (mS.value === "completions") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.completions)
                    }
                    else if (mS.value === "current") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.current)
                    }
                    else if (typeof mS.value === "number") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, mS.value, true)
                    }

                })
            }
        }
    }

    build(amount: number = 1) {
        this.amount += amount
        this.current += amount
        this.inputs.forEach((inp) => {
            inp.trigger(`amountChange`)
        })

        this.outputs.forEach((out) => {
            out.trigger(`amountChange`)
        })

        this.onAmountChange.trigger(this)
    }

    increaseCurrent(amount = 1) {
        amount = Math.min(this.amount - this.current, amount)
        this.current += amount
        this.onAmountChange.trigger(this)
        this.inputs.forEach((inp) => {
            inp.trigger(`amountChange`)
        })

        this.outputs.forEach((out) => {
            out.trigger(`amountChange`)
        })
    }

    decreaseCurrent(amount = 1) {
        amount = Math.min(this.current, amount)
        this.current -= amount
        this.onAmountChange.trigger(this)
        this.inputs.forEach((inp) => {
            inp.trigger(`amountChange`)
        })

        this.outputs.forEach((out) => {
            out.trigger(`amountChange`)
        })
    }
}

