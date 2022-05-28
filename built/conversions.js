export class modifierSelector {
    constructor(value, modifierID) {
        this.value = value;
        this.modifierID = modifierID;
    }
}
export class ConversionArguments {
    constructor() {
        this._inputs = [];
        this._outputs = [];
        this._modifierSelectors = [];
    }
    inputs(inputs) {
        this._inputs = inputs;
        return this;
    }
    outputs(outputs) {
        this._outputs = outputs;
        return this;
    }
    onFinish(onFinish) {
        this._onFinish = onFinish;
        return this;
    }
    modifier(value, modifierID) {
        this._modifierSelectors.push(new modifierSelector(value, modifierID));
        return this;
    }
    complete() {
        return new Conversion(this._inputs, this._outputs, this._modifierSelectors, this._onFinish);
    }
}
export function conversion() {
    return new ConversionArguments();
}
export class Conversion {
    constructor(inputs, outputs, modifierSelectors, onFinish) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.modifierSelectors = modifierSelectors;
        this.onFinish = onFinish;
        this.amount = 1;
        this.completions = 0;
    }
    checkConversion(complete) {
        //The maximum amount of conversion activations that can happen.
        let maxConversions = this.amount;
        //Reduce maxConversions to the input that can make the fewest activations.
        this.inputs.forEach(inp => {
            maxConversions = Math.floor(Math.min(inp.item.checkAmount(inp.total()), maxConversions));
        });
        //If there is more than 0 conversions, activate the outputs multiplied by the max conversions.
        if (maxConversions >= 1) {
            this.completions++;
            //Iterate through the outputs and add the amount to the stat
            this.outputs.forEach(out => {
                out.item.add(out.total() * maxConversions);
            });
            this.inputs.forEach(inp => {
                //Check if dontConsume is false. If it is true, don't consume the item ref amount.
                if (!inp.dontConsume)
                    inp.item.add(-(inp.total() * maxConversions));
            });
            if (this.onFinish)
                this.onFinish();
            if (complete)
                complete();
            if (this.modifierSelectors.length > 0) {
                this.modifierSelectors.forEach((mS) => {
                    //If the value selector is amount, replace it with the amount of this conversion.
                    if (mS.value === "amount") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, this.amount);
                    }
                    else if (mS.value === "completions") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, this.completions);
                    }
                    else if (typeof mS.value === "number") {
                        game.currentPlanet().globalModifiers.set(mS.modifierID, this, mS.value, true);
                    }
                });
            }
        }
    }
}
//# sourceMappingURL=conversions.js.map