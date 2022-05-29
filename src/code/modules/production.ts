import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const production = (items: Items) => {
    return new ModuleExporter(
        "production",
        [
            module()
                .id(`mine`)
                .name(`Native Copper`)
                .description(`The land is rich with small nuggets of glimmering native copper laying on the surface.
                Flecked with small blue patches of corrosion dot the surface. Your people seem to enjoy collecting the nuggets.`)
                .conversions([
                    conversion(`metalMining`)
                        .inputs([items.workForce(5)])
                        .outputs([items.metalOre(1)])
                        .complete()
                ])
                .complete(),

            module()
                .id(`smelting`)
                .name(`Campfire Forging`)
                .description(`The small lumps of metal laid upon the stones of a fire will start to soften and become workable
                The modifications to the lumps turn them into crude geometric shapes, but your people are more than happy to string them with plant fibre to create necklaces.`)
                .conversions([
                    conversion(`campfireSmelting`)
                        .inputs([items.metalOre(5)])
                        .outputs([items.metal(1)])
                        .complete()
                ])
                .complete(),

            module()
                .id(`metalImprovements`)
                .name(`Improve Tools with Metal`)
                .description(`The jewelry made by your people have become more intricate with time.
                As the smiths/jewelers continue to tinker with the metals, they have started to use the sharp edges that the metal can make for improving their hoes, knives and other tools.`)
                .conversions([
                    conversion(`metalImprovements`)
                        .amount(1)
                        .modifier(`current`, `metalTools`)
                        .complete()
                ])
                .complete()
        ]
    )
}