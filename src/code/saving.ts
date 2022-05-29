import { Items } from "./data/items";
import { ModifierCollection } from "./modifiers";
import { ModuleHandler } from "./module-handler";

class SaveObject {
    items: { id: string, amount: number, unlocked: boolean }[] = []
    modules: { id: string, transformHistory: string[], unlocked: boolean }[] = []
    conversions: { id: string, current: number, amount: number, completions: number }[] = []
    modifiers: { ownerID: string, id: string, amount: number }[] = []
}

export function saveModuleHandler(handler: ModuleHandler) {
    const jsonSaver = new SaveObject()

    //Item Saving
    for (const ite in handler.items) {
        const item = handler.items[ite as keyof Items]()
        jsonSaver.items.push({
            id: item.id,
            amount: item.total(),
            unlocked: item.unlocked
        })
    }

    //Module Saving
    handler.modules.forEach((mod) => {
        jsonSaver.modules.push({
            id: mod.id,
            transformHistory: mod.transformHistory,
            unlocked: mod.unlocked
        })
    })

    //Conversions Saving
    handler.conversions.forEach((con) => {
        jsonSaver.conversions.push({
            id: con.id,
            current: con.current,
            amount: con.amount,
            completions: con.completions
        })
    })

    //Modifiers Saving
    handler.globalModifiers.modifiers.forEach((modifierCollection, key) => {
        modifierCollection.collection.forEach((mod, key2) => {
            jsonSaver.modifiers.push({ ownerID: key2, id: key, amount: mod.value })
        })
    })

    window.localStorage.setItem(`saveFile`, JSON.stringify(jsonSaver))
    console.log(jsonSaver)
}

export function loadSaveFile(file: any, handler: ModuleHandler) {
    const jsonSave = JSON.parse(file) as SaveObject

    console.log(jsonSave)
    //Load Items
    jsonSave.items.forEach((ite) => {
        const item = handler.items[ite.id as keyof Items]()
        item.amount(ite.amount)
        item.unlocked = ite.unlocked
    })

    //Load Modules 
    jsonSave.modules.forEach((mod) => {
        const module = handler.modules.get(mod.id)
        if (module) {
            console.log(mod.transformHistory)
            mod.transformHistory.forEach((tra) => {

                module.transform(tra)
            })
            if (mod.unlocked) {
                module.unlock()
            }
            else module.unlocked = false
        }
        else console.warn(`Unable to find module ${mod.id}`)
    })

    //Load Conversions
    jsonSave.conversions.forEach((con) => {
        const conversion = handler.conversions.get(con.id)

        if (conversion) {
            conversion.current = con.current
            conversion.amount = con.amount
            conversion.completions = con.completions
        }
        else console.warn(`Unable to find module ${con.id}`)
    })

    //Load Modifiers
    jsonSave.modifiers.forEach((mod) => {
        handler.globalModifiers
            .set(mod.id, mod.ownerID, mod.amount)
    })
}