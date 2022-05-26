var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { EventHandler } from "./components/events.js";
export class ModuleArguments {
    constructor() {
        this._conversions = [];
        this._description = "";
        this._transforms = new Map();
    }
    id(id) {
        this._id = id;
        return this;
    }
    name(name) {
        this._name = name;
        return this;
    }
    description(description) {
        this._description = description;
        return this;
    }
    conversions(conversions) {
        this._conversions = conversions;
        return this;
    }
    button(type, title, cost, transform) {
        this._button = new ModuleButton(type, title, cost, transform);
        return this;
    }
    transform(id, transform) {
        transform.id(id);
        this._transforms.set(id, transform);
        return this;
    }
    complete() {
        const mod = (items) => {
            if (!this._id)
                throw new Error(`A Module Does not have an ID assigned to it.`);
            if (!this._name)
                throw new Error(`Module ${this._id} does not have a Name assigned to it.`);
            return new Module(items, this._id, this._name, this._description, this._conversions, this._transforms, this._button);
        };
        return mod.bind(this);
    }
}
export class ModuleButton {
    constructor(type, title, cost, transform) {
        this.type = type;
        this.title = title;
        this.cost = cost;
        this.transform = transform;
    }
}
export function module() {
    return new ModuleArguments();
}
//The module is what the base interface which interacts with the planet.
export class Module {
    constructor(items, id, name, description, conversions, transforms, //A map of module arguments which can be completed and overwrite this module.
    button) {
        this.items = items;
        this.id = id;
        this.name = name;
        this.description = description;
        this.conversions = conversions;
        this.transforms = transforms;
        this.button = button;
        //Event handler which is triggered when the transform method is complete.
        this.onTransform = new EventHandler();
    }
    //Called on each activation cycle
    activate(planet) {
        //Check the conversions, which will consume/output resources
        this.conversions.forEach(con => {
            con.checkConversion();
        });
    }
    //Transform this module using a set of module arguments.
    transform(transformName) {
        var _a;
        //Attempt to get the transform from the transforms map.
        const transform = (_a = this.transforms.get(transformName)) === null || _a === void 0 ? void 0 : _a.complete()(this.items);
        //Check that it pulls one that exists.
        if (transform) {
            const { onTransform } = transform, transformExcluded = __rest(transform, ["onTransform"]);
            Object.assign(this, transformExcluded);
            this.onTransform.trigger(this);
        }
        else
            console.warn(`Could not find transform ${transformName} on module ${this.id}`);
    }
}
export class ModuleExporter {
    constructor(id, modArray) {
        this.id = id;
        this.modArray = modArray;
    }
}
//# sourceMappingURL=module.js.map