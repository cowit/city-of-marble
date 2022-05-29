import { modi } from "../modifiers.js";
import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const foraging = (items: Items) => {
    return new ModuleExporter(
        "foraging",
        [
            module()
                .id("foraging")
                .name("Foraging")
                .description(`Your people will help you forage, feeding themselves and helping others.`)
                .conversions([
                    conversion(`foragingForage`)
                        .inputs([])
                        .outputs([items.food(1)])
                        .amount(1)
                        .complete()
                ])
                .transform(`foodLine`,
                    module()
                        .name("Food Production")
                        .description(`Manage your production of food.`)
                        .unlockConditions([unlock(modi(`farmsBuilt`), "more", 5)])
                )
                .complete(),
            module()
                .id("farming")
                .name("Plant Seeds")
                .description(`Plant some seeds from the most delicious crops in the muddy earth.`)
                .unlockConditions([unlock(items.housing(), "more", 1)])
                .button("trigger", `Plant seeds`,
                    conversion(`farmingPlantSeed`)
                        .inputs([items.food(1)])
                        .outputs([])
                        .complete(),
                    `fullFarming`
                )
                .transform("fullFarming",
                    module()
                        .name("Farming")
                        .description(`Your people have begun to reap what they sowed previously.  
                        This years growth in the area that you planted the seeds has grown better than any other.`)
                        .conversions([
                            conversion(`farmingHarvesting`)
                                .inputs([items.workForce(4, [modi(`irrigation`, 0.1)]), items.metal(0, [modi(`metalTools`, 0.1)])])
                                .outputs([items.food(5, [modi(`irrigation`, 0.25), modi(`metalTools`, 0.5)])])
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

            module()
                .id("basicIrrigation")
                .name("Basic Irrigation")
                .description(`Your people have started to notice that the best growing crops are grouped around the ponds and streams.
            Some have made small trenches for the water to flow deeper in towards the crops.`)
                .unlockConditions([unlock(modi(`farmsBuilt`), "more", 5)])
                .button("build", "Invest in digging more trenches",
                    conversion(`irrigationDigMore`)
                        .inputs([items.localWater(1, [modi(`irrigation`, 0.5)]), items.workForce(5, [modi(`irrigation`, 5)])])
                        .modifier(`completions`, `irrigation`)
                        .complete()
                )
                .complete()
        ]
    )
}
