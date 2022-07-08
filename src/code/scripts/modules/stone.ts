import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const stone = (items: Items) => {
    return new ModuleExporter(
        "stone",
        "Quarrying",
        [
            module(`quarry`)
                .name(`Stone Quarry`)
                .description(`If your people are going to construct sturdier buildings, they will need stone
                A quarry will supply what is needed.
                If you are short on labor, reducing the amount used for quarrying can help you grow.`)
                .conversions([
                    conversion(`stoneQuarrying`)
                        .inputs([items.labor(2, [modi(`quarryRoads`, -0.5), modi(`quarryDepletions`, 0.01), modi(`passiveQuarries`, 0.1)]), items.metal(0, [modi(`metalTools`, 0.05)])])
                        .outputs([items.stone(1, [modi(`metalTools`, 0.5)])])
                        .modifier(`completions`, `quarryDepletions`)
                        .amount(1)
                        .complete()
                ])
                .unlockConditions([unlock(items.population(), "more", 20)])
                .complete(),
            module(`quarryTransport`)
                .name(`Transportation`)
                .description(`The backbreaking work of hauling the massive blocks of stone from the lower levels of the quarry is starting to become far more clear as your people harvest deeper stone.
                Improving the crude ramps and roads which circle the site will greatly reduce the efforts needed to haul out the blocks.`)
                .button(`build`, `Improve quarry roads`,
                    conversion(`quarryRoadsButton`)
                        .inputs([items.labor(10, [modi(`quarryRoads`, 10)]), items.wood(15)])
                        .modifier(1, `quarryRoads`)
                        .complete()
                )
                .unlockConditions([unlock(items.population(), "more", 20)])
                .complete(),
            module(`newQuarry`)
                .name(`Create new Quarry`)
                .description(`Quarries will slowly deplete over time. Begin the construction of a new quarry which will have to be improved again.
                Previous quarries will always provide a passive trickle of stone.`)
                .button(`trigger`, `Start new quarry`,
                    conversion(`newQuarry`)
                        .inputs([items.land(1)])
                        .modifier(1, `passiveQuarries`)
                        .modifier('clear', `quarryRoads`)
                        .modifier('clear', `quarryRoads`)
                        .complete()
                )
                .unlockConditions([unlock(items.population(), "more", 20)])
                .complete()
        ]
    )
}