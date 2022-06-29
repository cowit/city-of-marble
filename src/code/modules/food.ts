import { modi } from "../modifiers.js";
import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const food = (items: Items) => {
    return new ModuleExporter(
        "food",
        [

            module(`farming`)
                .name("Plant Seeds")
                .description(`Plant some seeds from the most delicious crops in the muddy earth.`)
                .unlockConditions([unlock(items.housing(), "atleast", 1)])
                .button("trigger", `Plant seeds`,
                    conversion(`farmingPlantSeed`)
                        .inputs([items.food(1)])
                        .outputs([])
                        .complete(),
                    `fullFarming`
                )
                .transform("fullFarming",
                    module(`fullFarming`)
                        .name("Farming")
                        .description(`Your people have begun to reap what they sowed previously.  
                        This years growth in the area that you planted the seeds has grown better than any other.`)
                        .conversions([
                            conversion(`farmingHarvesting`)
                                .amount(1)
                                .inputs([items.labor(4, [modi(`irrigation`, 0.1)]), items.metal(0, [modi(`metalTools`, 0.05)])])
                                .outputs([items.food(4.5, [modi(`irrigation`, 0.20), modi(`metalTools`, 1.5)])])
                                .complete()
                        ])
                        .button("build", "Sow more land",
                            conversion(`farmingSowMoreLand`)
                                .inputs([items.land(1)])
                                .modifier(`completions`, `farmsBuilt`)
                                .complete()
                        )
                )
                .complete(),

            module(`basicIrrigation`)
                .name("Basic Irrigation")
                .description(`Your people have started to notice that the best growing crops are grouped around the ponds and streams.
            Some have made small trenches for the water to flow deeper in towards the crops.`)
                .unlockConditions([unlock(modi(`farmsBuilt`), "more", 5)])
                .button("build", "Invest in digging more trenches",
                    conversion(`irrigationDigMore`)
                        .inputs([items.localWater(1, [modi(`irrigation`, 0.5)]), items.labor(5, [modi(`irrigation`, 5)])])
                        .modifier(`completions`, `irrigation`)
                        .complete()
                )
                .complete()
        ]
    )
}
