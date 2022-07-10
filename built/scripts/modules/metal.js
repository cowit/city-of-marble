import { conversion } from "../conversions.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";
export const metal = (items) => {
    return new ModuleExporter("metal", "Metallurgy", [
        module(`mine`)
            .name(`Native Copper`)
            .description(`The land is rich with small nuggets of glimmering native copper laying on the surface.
                Flecked with small blue patches of corrosion dot the surface. Your people seem to enjoy collecting the nuggets.`)
            .conversions([
            conversion(`metalMining`)
                .inputs([items.labor(4)])
                .outputs([items.metalOre(1)])
                .amount(1)
                .complete()
        ])
            .button(`build`, `Send More Gatherers`, conversion(`sendGatherers`)
            .inputs([items.labor(25)])
            .complete())
            .unlockConditions([unlock(items.population(), `more`, 50)])
            .complete(),
        module(`smelting`)
            .name(`Campfire Forging`)
            .description(`The small lumps of metal laid upon the stones of a fire will start to soften and become workable
                The modifications to the lumps turn them into crude geometric shapes, but your people are more than happy to string them with plant fibre to create necklaces.
                It might be beneficial to create some camp fires set aside just for working the metals.`)
            .conversions([
            conversion(`campfireSmelting`)
                .inputs([items.labor(5), items.metalOre(5, [modi(`forgeEfficiency`, -1)])])
                .outputs([items.metal(1, [modi(`forgeEfficiency`, 0.5)])])
                .amount(1)
                .complete()
        ])
            .button(`build`, `Set up fires`, conversion(`moreFires`)
            .inputs([items.wood(5), items.labor(10)])
            .complete())
            .unlockConditions([unlock(items.population(), `more`, 50)])
            .complete(),
        module(`metalImprovements`)
            .name(`Improve Tools with Metal`)
            .description(`The jewelry made by your people have become more intricate with time.
                As the smiths/jewelers continue to tinker with the metals, they have started to use the sharp edges that the metal can make for improving their hoes, knives and other tools.
                (You can reduce the metal cost of workers by clicking the minus button.)`)
            .conversions([
            conversion(`metalImprovements`)
                .amount(1)
                .modifier(`current`, `metalTools`)
                .complete()
        ])
            .unlockConditions([unlock(items.population(), `more`, 50)])
            .complete()
    ]);
};
//# sourceMappingURL=metal.js.map