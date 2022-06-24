export function itemIcon(item, parent, conversion) {
    const comp = $(/*html*/ `
    <div class="icon-wrapper">
       <img src="${item.icon}" class="con-icon">
        <p class="conversion-amount">  ${item.total()}</p> 
    </div>
    `);
    const amountEle = comp.find(".conversion-amount");
    if (!conversion) {
        comp.append(/*html*/ `<p class="conversion-amount item-display-text" capacity>/${item.capacity}</p>`);
        comp.append(/*html*/ `<p class="conversion-amount item-display-text" current>${item.amountChange.current}</p>`);
        amountEle.addClass(`item-display-text`);
        comp.hide();
    }
    const capacityEle = comp.find(".conversion-amount[capacity]");
    const currentEle = comp.find(".conversion-amount[current]");
    //Add the tooltip functions
    comp.on("mousemove", (event) => {
        tooltip.display(event, item.name);
    });
    comp.on("mouseleave", () => {
        tooltip.hide();
    });
    if (conversion) {
        item.onModifierChange.listen((e) => {
            if (e.newAmount === 0)
                comp.hide();
            else
                comp.show();
        });
    }
    //Subscribe to the change amount event to keep the icon updated.
    item.on("amountChange", (e) => {
        if (!conversion)
            comp.show();
        if (conversion && conversion.current > 0) {
            e.newAmount *= conversion.current;
        }
        var toShow = e.newAmount.toString();
        if (e.newAmount % 1 !== 0 && e.newAmount !== 0 && e.newAmount < 100)
            toShow = e.newAmount.toFixed(2);
        else if (e.newAmount > 100)
            toShow = Math.floor(e.newAmount).toString();
        amountEle.text(toShow);
        //Display the current capacity
        if (e.item.capacity > 0) {
            capacityEle.show();
            capacityEle.text(`\\ ${Math.floor(e.item.capacity)}`);
        }
        else {
            capacityEle.hide();
        }
    });
    //Subscribe and change UI when the item is activated
    if (!conversion) {
        item.on(`activation`, (e) => {
            var toShow = item.amountChange.current;
            if (e.newAmount % 1 !== 0 && e.newAmount !== 0 && e.newAmount < 100)
                toShow = toShow.toFixed(2);
            else if (e.newAmount > 100)
                toShow = Math.floor(toShow).toString();
            //Display the current changes
            if (item.amountChange.current > 0) {
                currentEle.text("+" + toShow);
            }
            else
                currentEle.text(toShow);
        });
    }
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
        this.secondaryComponents = [];
    }
    hide() {
        this.element.hide();
        this.secondaryComponents.forEach(sec => sec.hide());
    }
    show() {
        this.element.show();
        this.secondaryComponents.forEach(sec => sec.show());
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
    conversionBox(con, isButton = false) {
        //Create the component HTML string.
        const comp = $(/*html*/ `
        <div class="conversion-wrapper">
            <div class="conversion-items" inputs></div>
            <i class="fa-solid fa-arrow-right con-arrow"></i>
            <div class="conversion-items" outputs></div>
            
        </div>
        `);
        if (!isButton && con.displayButtons) {
            comp.append(/*html*/ `
            <div class="amount-controls">
                <p class="square-button button" minus><i class="fa-solid fa-minus"></i></p>
                <p class="amount-text current">${con.current}</p>
                <p class="amount-text">/</p>
                <p class="amount-text maximum">${con.amount}</p>
                <p class="square-button button" plus><i class="fa-solid fa-plus"></i></p>
            </div>
            `);
        }
        const amountButtons = comp.find(`.amount-controls`);
        if (con.amount < 1)
            amountButtons.hide();
        const currentEle = comp.find(`.current`);
        const amountEle = comp.find(`.maximum`);
        comp.find(`[plus]`).on("click", () => {
            con.increaseCurrent();
        });
        comp.find(`[minus]`).on("click", () => {
            con.decreaseCurrent();
        });
        con.onAmountChange.listen(() => {
            if (con.amount < 1)
                amountButtons.hide();
            else
                amountButtons.show();
            currentEle.text(con.current);
            amountEle.text(con.amount);
        });
        //Create the UI component.
        const uic = new UIComponent(comp);
        //Add an item icon to the UIC for each input. If there are no inputs, hide the box and arrow.
        if (con.inputs.length > 0) {
            con.inputs.forEach(inp => {
                const iconText = itemIcon(inp, this, con)
                    .appendTo(comp.find(".conversion-items[inputs]"))
                    .addClass("negative")
                    .find('.conversion-amount');
                inp.on("modifierChange", (e) => {
                    iconText.text(e.newAmount);
                });
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
                const iconText = itemIcon(out, this, con)
                    .appendTo(comp.find(".conversion-items[outputs]"))
                    .addClass("positive")
                    .find('.conversion-amount');
                out.on("modifierChange", (e) => {
                    iconText.text(e.newAmount);
                });
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
        uic.conversionBox(button.cost, true);
        comp.on("click", () => {
            button.cost.checkConversion(() => {
                if (button.type === "build") {
                    module.conversions.forEach(con => {
                        con.build();
                    });
                }
                else if (button.type === "buildIncreaseAmount") {
                    module.conversions.forEach(con => {
                        con.build();
                    });
                    button.cost.build();
                }
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
        this.children = [];
    }
    module(mod) {
        const comp = $(/*html*/ `
        <div class="module-wrapper fade">
            <div class="module-name">
            <p class="module-name-text">${mod.name}</p>
            <i class="fa-solid fa-circle-exclamation unlock-marker"></i>
            </div>
            
            <p class="module-description">${mod.description}</p>
            <div class="ui-components-wrapper">

            </div>
        </div>`);
        const uic = new UIComponent(comp);
        mod.uiComponent = uic;
        uic.parent = this;
        this.element.append(comp);
        const unlockMarker = comp.find(".unlock-marker").hide();
        if (this.children.length > 0) {
            const modLine = $(/*html*/ ` <p class="module-connector fade">|</p>`);
            uic.secondaryComponents.push(modLine);
            comp.before(modLine);
        }
        mod.conversions.forEach(con => {
            uic.conversionBox(con);
        });
        if (mod.buttons.length > 0) {
            mod.buttons.forEach(but => {
                uic.moduleButton(but, mod);
            });
        }
        //When the module is unlocked
        mod.onUnlock.listen(() => {
            unlockMarker.show();
        });
        //When this module is hovered over, hide the unlock marker.
        comp.on('mouseenter', () => {
            unlockMarker.hide();
        });
        mod.onTransform.listen(() => {
            comp.find(`.module-name-text`).text(mod.name);
            comp.find(`.module-description`).text(mod.description);
            comp.find(`.conversion-wrapper`).remove();
            mod.conversions.forEach(con => {
                uic.conversionBox(con);
            });
            comp.find(`.module-button`).remove();
            if (mod.buttons.length > 0) {
                mod.buttons.forEach(but => {
                    uic.moduleButton(but, mod);
                });
            }
        });
        //Hide modules which aren't unlocked yet. Set if there is any unlock conditions on the module.
        if (mod.unlocked === false)
            uic.hide();
        this.children.push(uic);
        return uic;
    }
}
//# sourceMappingURL=ui.js.map