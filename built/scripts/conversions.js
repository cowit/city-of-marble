import { EventHandler } from "./components/events.js";
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
        this._amount = { total() { return this.value; }, value: 0 };
        this._displayButtons = true;
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
    amount(baseValue = 0, modifier) {
        if (!modifier)
            this._amount = { total() { return this.value; }, value: baseValue };
        else {
            if (Array.isArray(modifier)) {
                var modVar;
                modifier.forEach(mod => {
                    if (modVar)
                        this._amount = game.currentPlanet().globalModifiers.subscribe(mod, modVar);
                    else
                        modVar = game.currentPlanet().globalModifiers.subscribe(mod, baseValue);
                });
                if (modVar)
                    this._amount = modVar;
            }
            else
                this._amount = modifier;
        }
        return this;
    }
    id(id) {
        this._id = id;
        return this;
    }
    hideButtons() {
        this._displayButtons = false;
        return this;
    }
    complete() {
        if (!this._id) {
            console.error(`No ID found for conversion. `, this);
            throw new Error(`No ID given.`);
        }
        const con = new Conversion(this._id, this._inputs, this._outputs, this._modifierSelectors, this._amount, this._onFinish, this._displayButtons);
        game.currentPlanet().conversions.set(this._id, con);
        return con;
    }
}
export function conversion(id) {
    const conArg = new ConversionArguments();
    conArg.id(id);
    return conArg;
}
export class Conversion {
    constructor(id, inputs, outputs, modifierSelectors, amount, onFinish, displayButtons = true) {
        this.id = id;
        this.inputs = inputs;
        this.outputs = outputs;
        this.modifierSelectors = modifierSelectors;
        this.amount = amount;
        this.onFinish = onFinish;
        this.displayButtons = displayButtons;
        this.current = 0;
        this.completions = 0;
        this.onAmountChange = new EventHandler();
        this.build(this.amount.total());
    }
    checkConversion(complete) {
        //The maximum amount of conversion activations that can happen.
        let maxConversions = this.current;
        //Reduce maxConversions to the input that can make the fewest activations.
        this.inputs.forEach(inp => {
            if (inp.total() > 0) {
                maxConversions = Math.floor(Math.min(inp.item.checkAmount(inp.total()), maxConversions));
            }
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
            this.setModifiers();
        }
    }
    build(amount = 1) {
        this.amount.value += amount;
        this.current += amount;
        this.inputs.forEach((inp) => {
            inp.trigger(`amountChange`);
        });
        this.outputs.forEach((out) => {
            out.trigger(`amountChange`);
        });
        this.onAmountChange.trigger(this);
    }
    increaseCurrent(amount = 1) {
        if (this.current < this.amount.total()) {
            this.current += amount;
            this.onAmountChange.trigger(this);
            this.inputs.forEach((inp) => {
                inp.trigger(`amountChange`);
            });
            this.outputs.forEach((out) => {
                out.trigger(`amountChange`);
            });
            this.setModifiers();
        }
    }
    decreaseCurrent(amount = 1) {
        if (this.current > 0) {
            this.current -= amount;
            this.onAmountChange.trigger(this);
            this.inputs.forEach((inp) => {
                inp.trigger(`amountChange`);
            });
            this.outputs.forEach((out) => {
                out.trigger(`amountChange`);
            });
            this.setModifiers();
        }
    }
    setModifiers() {
        if (this.modifierSelectors.length > 0) {
            this.modifierSelectors.forEach((mS) => {
                //If the value selector is amount, replace it with the amount of this conversion.
                if (mS.value === "amount") {
                    game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.amount.total());
                }
                else if (mS.value === "completions") {
                    game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.completions);
                }
                else if (mS.value === "current") {
                    game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, this.current);
                }
                else if (mS.value === "clear") {
                    game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, 0);
                }
                else if (typeof mS.value === "number") {
                    game.currentPlanet().globalModifiers.set(mS.modifierID, this.id, mS.value, true);
                }
            });
        }
    }
}
//# sourceMappingURL=conversions.js.map