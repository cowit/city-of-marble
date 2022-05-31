import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const temple = (items: Items) => {
    return new ModuleExporter(
        "temple",
        [
            module(`temple`)
                .name(`Vision of The Grand Temple`)
                .description(`In your dreams you see a majestic temple made of expertly crafted stone masonry and filled to the brim with clamoring masses.
            Whether they are seeking salvation or simply a place to be, it occurs to you that it is your purpose to fulfill their desire.`)
                .button(`trigger`, `Begin constrution of The Temple`, conversion(`beginTemple`).complete())
                .complete()
        ]
    )
}