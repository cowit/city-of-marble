import { conversion } from "../conversions.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter } from "../module.js";
export const stone = (items) => {
    return new ModuleExporter("stone", [
        module(`quarry`)
            .name(`Stone Quarry`)
            .description(`If your people are going to construct sturdier buildings, they will need stone
                A quarry will supply what is needed.`)
            .conversions([
            conversion(`stoneQuarrying`)
                .inputs([items.labor(10, [modi(`quarryRoads`, 0.5)]), items.metal(0, [modi(`metalTools`, 0.05)])])
                .outputs([items.stone(1, [modi(`metalTools`, 0.5)])])
                .complete()
        ])
            .button(`build`, `Build Quarries`, conversion(`buildQuarries`)
            .inputs([items.labor(50), items.wood(25)])
            .complete())
            .complete(),
        module(`quarryTransport`)
            .name(`Transportation`)
            .description(`The backbreaking work of hauling the massive blocks of stone from the lower levels of the quarry is starting to become far more clear as your people harvest deeper stone.
                Improving the crude ramps and roads which circle the site will greatly reduce the efforts needed to haul out the blocks.`)
            .button(`build`, `Improve quarry roads`, conversion(`quarryRoadsButton`)
            .amount(1)
            .inputs([items.labor(25, [modi(`quarryRoads`, 10)]), items.wood(15)])
            .modifier(`completions`, `quarryRoads`)
            .complete())
            .complete()
    ]);
};
//# sourceMappingURL=stone.js.map