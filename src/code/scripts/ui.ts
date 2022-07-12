import { Conversion } from "./conversions.js"
import { Item, ItemRef } from "./data/items.js"
import { ModuleHandler } from "./module-handler.js"
import { Module, ModuleButton, ModuleExporter } from "./module.js"

export function itemIcon(item: Item | ItemRef, parent: UIComponent | JQuery, conversion?: Conversion) {
    const comp = $(/*html*/`
    <div class="icon-wrapper">
       <img src="${item.icon}" class="con-icon">
        <p class="conversion-amount">  ${item.total()}</p> 
    </div>
    `)
    const amountEle = comp.find(".conversion-amount")
    if (!conversion) {
        comp.append(/*html*/`<p class="conversion-amount item-display-text" capacity>/${item.capacity}</p>`)
        comp.append(/*html*/`<p class="conversion-amount item-display-text" current>${item.amountChange.current}</p>`)
        amountEle.addClass(`item-display-text`)
        comp.hide()
    }
    const capacityEle = comp.find(".conversion-amount[capacity]")
    const currentEle = comp.find(".conversion-amount[current]")
    //Add the tooltip functions
    comp.on("mousemove", (event) => {
        tooltip.display(event, item.name)
    })
    comp.on("mouseleave", () => {
        tooltip.hide()
    })

    if (conversion) {
        item.onModifierChange.listen((value) => {
            if (value === 0) comp.hide()
            else comp.show()
        })
    }

    //When the item unlock is toggled, hide/show it
    item.onUnlockToggle.listen((state) => {
        if (state) {
            comp.show()
        }
        else {
            comp.hide()
        }
    })


    //Subscribe to the change amount event to keep the icon updated.
    item.on("amountChange", (value) => {

        if (!conversion) comp.show()
        if (conversion && conversion.current > 0) {
            value *= conversion.current
        }
        var toShow = value.toString()
        if (value % 1 !== 0 && value !== 0 && value < 100) toShow = value.toFixed(2)
        else if (value > 100) toShow = Math.floor(value).toString()
        amountEle.text(toShow)



        //Display the current capacity
        if (item.capacity > 0) {
            capacityEle.show()
            capacityEle.text(`\\ ${Math.floor(item.capacity)}`)
        }
        else {
            capacityEle.hide()
        }
    })

    //Subscribe and change UI when the item is activated
    if (!conversion) {
        item.on(`activation`, (e) => {

            var toShow: number | string = item.amountChange.current
            toShow = toShow.toFixed(2)
            //Display the current changes
            if (item.amountChange.current > 0) {
                currentEle.text("+" + toShow)
            }
            else currentEle.text(toShow)
        })
    }
    var uic
    if (parent instanceof UIComponent) {
        uic = new UIComponent(comp, parent)
        parent.element.append(comp)
    }
    else {
        uic = new UIComponent(comp)
        parent.append(comp)
    }
    return uic
}

export class UIComponent {
    secondaryComponents: JQuery[] = []
    constructor(public element: JQuery, public parent?: UIComponent) { }

    hide() {
        this.element.hide()
        this.secondaryComponents.forEach(sec => sec.hide())
    }

    show() {
        this.element.show()
        this.secondaryComponents.forEach(sec => sec.show())
    }

    appendTo(newParent: JQuery) {
        return this.element.appendTo(newParent)
    }

    moduleLine(modLine: ModuleExporter, handler: ModuleHandler) {
        const comp = $(/*html*/`
            <div class="module-container">
            </div>
        `)

        const tab = $(/*html*/`
            <div class="tab button" id="${modLine.id}">
                ${modLine.name}
            </div>
        `)

        $(`#tabs-row`).append(tab)
        const uic = new ModuleLine(comp)
        uic.parent = this
        this.element.append(comp)

        const exclamationMark = $(/*html*/`
        <i class="fa-solid fa-circle-exclamation unlock-marker"></i>
        `).hide()
        tab.append(exclamationMark)

        tab.hide()
        tab.on(`click`, () => {
            handler.lines.forEach(lin => {
                lin.hide()
            })

            uic.show()
            $(exclamationMark).hide()
        })
        return uic
    }

    conversionBox(con: Conversion, isButton = false) {
        //Create the component HTML string.
        const comp = $(/*html*/`
        <div class="conversion-wrapper">
            <div class="conversion-items" inputs></div>
            <i class="fa-solid fa-arrow-right con-arrow"></i>
            <div class="conversion-items" outputs></div>
            
        </div>
        `)

        if (!isButton && con.displayButtons) {
            comp.append(/*html*/`
            <div class="amount-controls">
                <p class="square-button button" minus><i class="fa-solid fa-minus"></i></p>
                <p class="amount-text current">${con.current}</p>
                <p class="amount-text">/</p>
                <p class="amount-text maximum">${con.amount}</p>
                <p class="square-button button" plus><i class="fa-solid fa-plus"></i></p>
            </div>
            `)
        }

        const amountButtons = comp.find(`.amount-controls`)
        if (con.amount.total() < 1) amountButtons.hide()
        const currentEle = comp.find(`.current`)
        const amountEle = comp.find(`.maximum`)

        comp.find(`[plus]`).on("click", () => {
            con.increaseCurrent()
        })

        comp.find(`[minus]`).on("click", () => {
            con.decreaseCurrent()
        })

        con.onAmountChange.listen(() => {
            if (con.amount.total() < 1) amountButtons.hide()
            else amountButtons.show()
            currentEle.text(con.current)
            amountEle.text(con.amount.total())
        })

        //Create the UI component.
        const uic = new UIComponent(comp)

        //Add an item icon to the UIC for each input. If there are no inputs, hide the box and arrow.
        if (con.inputs.length > 0) {
            con.inputs.forEach(inp => {
                const iconWrapper = itemIcon(inp, this, con)
                    .appendTo(comp.find(".conversion-items[inputs]"))
                    .addClass("negative")
                inp.on("modifierChange", (value) => {
                    iconWrapper.find('.conversion-amount').text(value)
                })


                if (inp.total() === 0) iconWrapper.hide()
            })
        }
        else {
            comp.find("[inputs]").hide()
            comp.find(".con-arrow").hide()
            comp
                .addClass("wide")
                .find("[outputs]")
                .addClass("wide")
                .append(/*html*/`
                <i class="fa-solid fa-caret-up icon-carets positive"></i>
                `)
        }

        //Same for outputs.
        if (con.outputs.length > 0) {
            con.outputs.forEach(out => {
                const iconWrapper = itemIcon(out, this, con)
                    .appendTo(comp.find(".conversion-items[outputs]"))
                    .addClass("positive")


                out.on("modifierChange", (value) => {
                    iconWrapper.find('.conversion-amount').text(value)
                })
                if (out.total() === 0) iconWrapper.hide()
            })
        }
        else {
            comp.find("[outputs]").hide()

            comp.find(".con-arrow").hide()
            comp.addClass("wide")
                .find("[inputs]")
                .addClass("wide")
                .append(/*html*/`
                <i class="fa-solid fa-caret-down icon-carets negative"></i>
                `)
        }

        uic.parent = this
        this.element.append(comp)
        return uic
    }


    moduleButton(button: ModuleButton, module: Module) {
        const comp = $(/*html*/`
        <div class="button module-button">
            <p class="button-title">${button.title}</p>

        </div>
        `)

        const uic = new UIComponent(comp)

        uic.conversionBox(button.cost, true)

        comp.on("click", () => {
            button.cost.checkConversion(() => {
                if (button.type === "build") {
                    module.conversions.forEach(con => {
                        con.build()
                    })
                }
                else if (button.type === "buildIncreaseAmount") {
                    module.conversions.forEach(con => {
                        con.build()
                    })
                    button.cost.build()
                }
                else if (button.type === "lock") {
                    module.disable()
                }
            })
        })
        uic.parent = this
        this.element.append(comp)
        return uic
    }
}

export class ModuleLine extends UIComponent {
    children: UIComponent[] = []
    constructor(public element: JQuery) {
        super(element)
    }

    module(mod: Module) {
        const comp = $(/*html*/`
        <div class="module-wrapper fade">
            <div class="module-name">
            <p class="module-name-text">${mod.name}</p>
            <i class="fa-solid fa-circle-exclamation unlock-marker"></i>
            </div>
            
            <p class="module-description">${mod.description}</p>
            <div class="ui-components-wrapper">

            </div>
        </div>`)


        const uic = new UIComponent(comp)
        mod.uiComponent = uic
        uic.parent = this
        this.element.append(comp)

        const unlockMarker = comp.find(".unlock-marker").hide()

        mod.conversions.forEach(con => {
            uic.conversionBox(con)
        })

        if (mod.buttons.length > 0) {
            mod.buttons.forEach(but => {
                uic.moduleButton(but, mod)
            })
        }

        //When the module is unlocked
        mod.onUnlock.listen(() => {
            unlockMarker.show()
        })

        //When this module is hovered over, hide the unlock marker.
        comp.on('mouseenter', () => {
            unlockMarker.hide()
        })

        //Hide modules which aren't unlocked yet. Set if there is any unlock conditions on the module.
        if (mod.unlocked === false) uic.hide()
        this.children.push(uic)
        return uic
    }
}