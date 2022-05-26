export function itemIcon(item, parent) {
    const comp = $(/*html*/ `
    <div class="icon-wrapper">
       <img src="${item.icon}" class="con-icon">
        <p class="conversion-amount">  ${item.total()}</p> 
    </div>
    `);
    const amountEle = comp.find(".conversion-amount");
    //Add the tooltip functions
    comp.on("mousemove", (event) => {
        tooltip.display(event, item.name);
    });
    comp.on("mouseleave", () => {
        tooltip.hide();
    });
    //Subscribe to the change amount event to keep the icon updated.
    item.on("amountChange", (newAmount) => {
        var toShow = newAmount.toString();
        if (newAmount % 1 !== 0 && newAmount !== 0)
            toShow = newAmount.toPrecision(2);
        amountEle.text(toShow);
    });
    var uic;
    if (parent instanceof UIComponent) {
        uic = new UIComponent(comp, parent);
        parent.element.append(comp);
    }
    else {
        uic = new UIComponent(comp);
        parent.append(comp);
    }
    return uic;
}
export class UIComponent {
    constructor(element, parent) {
        this.element = element;
        this.parent = parent;
    }
    appendTo(newParent) {
        return this.element.appendTo(newParent);
    }
    moduleLine() {
        const comp = $(/*html*/ `
            <div class="module-container">
            </div>
        `);
        const uic = new ModuleLine(comp);
        uic.parent = this;
        this.element.append(comp);
        return uic;
    }
    conversionBox(con) {
        //Create the component HTML string.
        const comp = $(/*html*/ `
        <div class="conversion-wrapper">
            <div class="conversion-items" inputs></div>
            <i class="fa-solid fa-arrow-right con-arrow"></i>
            <div class="conversion-items" outputs></div>
        </div>
        `);
        //Create the UI component.
        const uic = new UIComponent(comp);
        //Add an item icon to the UIC for each input. If there are no inputs, hide the box and arrow.
        if (con.inputs.length > 0) {
            con.inputs.forEach(inp => {
                itemIcon(inp, this)
                    .appendTo(comp.find(".conversion-items[inputs]"))
                    .addClass("negative");
            });
        }
        else {
            comp.find("[inputs]").hide();
            comp.find(".con-arrow").hide();
            comp
                .addClass("wide")
                .find("[outputs]")
                .addClass("wide")
                .append(/*html*/ `
                <i class="fa-solid fa-caret-up icon-carets positive"></i>
                `);
        }
        //Same for outputs.
        if (con.outputs.length > 0) {
            con.outputs.forEach(out => {
                itemIcon(out, this)
                    .appendTo(comp.find(".conversion-items[outputs]"))
                    .addClass("positive");
            });
        }
        else {
            comp.find("[outputs]").hide();
            comp.find(".con-arrow").hide();
            comp.addClass("wide")
                .find("[inputs]")
                .addClass("wide")
                .append(/*html*/ `
                <i class="fa-solid fa-caret-down icon-carets negative"></i>
                `);
        }
        uic.parent = this;
        this.element.append(comp);
        return uic;
    }
    moduleButton(button, module) {
        const comp = $(/*html*/ `
        <div class="button module-button">
            <p class="button-title">${button.title}</p>

        </div>
        `);
        const uic = new UIComponent(comp);
        uic.conversionBox(button.cost);
        comp.on("click", () => {
            button.cost.checkConversion(() => {
                console.log(button.transform);
                if (button.type === "build")
                    button.cost.amount++;
                if (button.transform)
                    module.transform(button.transform);
            });
        });
        uic.parent = this;
        this.element.append(comp);
        return uic;
    }
}
export class ModuleLine extends UIComponent {
    constructor(element) {
        super(element);
        this.element = element;
    }
    //<p class="square-button button"><i class="fa-solid fa-minus"></i></p>
    //<p class="square-button button"><i class="fa-solid fa-plus"></i></p>
    module(mod) {
        const comp = $(/*html*/ `
        <div class="module-wrapper">
            <div class="module-name">
            <p class="module-name-text">${mod.name}</p>
            </div>
            
            <p class="module-description">${mod.description}</p>
            <div class="ui-components-wrapper">

            </div>
        </div>`);
        const uic = new UIComponent(comp);
        uic.parent = this;
        this.element.append(comp);
        comp.after(/*html*/ ` <p class="module-connector">|</p>`);
        mod.conversions.forEach(con => {
            uic.conversionBox(con);
        });
        mod.onTransform.listen(() => {
            console.log(`On Transform`);
            comp.find(`.module-name-text`).text(mod.name);
            comp.find(`.module-description`).text(mod.description);
        });
        if (mod.button)
            uic.moduleButton(mod.button, mod);
        return uic;
    }
}
//# sourceMappingURL=ui.js.map