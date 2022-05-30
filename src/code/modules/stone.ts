import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const stone = (items: Items) => {
    return new ModuleExporter(
        "stone",
        [
            module(`quarry`)
                .name(`Stone Quarry`)
                .description(`If your people are going to construct sturdier buildings, they will need stone
                A quarry will supply what is needed.`)
                .conversions([
                    conversion(`stoneQuarrying`)
                        .inputs([items.workForce(10)])
                        .outputs([items.stone(1)])
                        .complete()
                ])
                .complete()
        ]
    )
}