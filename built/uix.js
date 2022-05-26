export function UIX(templateSelector, object) {
    //Check if the template exists on the HTML document
    const template = $(`${templateSelector}`);
    if (template.length === 1) { //Check if it only selects 1 template.
        //Create a JQUERY element using the template
        const element = $(template.html());
        //Find all children with a UIX attribute
        element.find(`[uix]`).each((index, child) => {
            const ele = $(child);
            //Get the UIX attribute value
            const accessor = ele.attr("uix");
            //Clear the undefined union
            if (accessor) {
                //Check that the property being accessed exists on the object.
                if (accessor in object) {
                    ele.text(object[accessor]);
                    Object.defineProperty(object, accessor, {
                        set(newValue) {
                            object[accessor] = newValue;
                            console.log(newValue);
                            ele.text(newValue);
                        }
                    });
                }
                else
                    console.warn(`Cannot find property ${accessor} on the object`, object);
            }
        });
        return element;
    }
    else if (template.length <= 0)
        throw new Error(`Template selector ${templateSelector} returned no templates"`);
    else
        throw new Error(`Template selector ${templateSelector} returned more than one template. Please anrrow your selector.`);
}
export function templateModule(mod) {
    return UIX(`#module-template`, mod);
}
//# sourceMappingURL=uix.js.map