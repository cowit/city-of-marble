import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";

export const main = (items: Items) => {
    return new ModuleExporter(
        "main",
        [
            module(`start`)
                .name(`Start Off`)
                .description(`Begin your journey, breaking off from your group with your family a few others to continue your growth.`)
                .button("trigger", `Set Off`,
                    conversion(`startGame`)
                        .outputs([items.food(1)])
                        .complete())
                .complete()
            ,
            module(`explore`)
                .name("Exploring")
                .description(`You are a small group of hunter-gatherers trying to survive and grow.
            <br>(Click the button below to forage for some food and explore the land.)
            (Items in the left box are consumed, items in the right are added.)`)
                .conversions([])
                .button("trigger", "Explore for more land to forage",
                    conversion(`exploreButton`)
                        .inputs([items.unexploredLand(1), items.food(5)])
                        .outputs([items.land(1), items.localWater(1), items.wood(1)])
                        .modifier(1, `exploredLand`)
                        .complete())
                .unlockConditions([unlock(items.food(), "atleast", 1)], [`start`])
                .complete(),
            module(`foraging`)
                .name("Foraging")
                .description(`Your people will help you forage, feeding themselves and helping others.
                <br>(In boxes with only an input or output, they will be marked with an up or down arrow!)`)
                .conversions([
                    conversion(`foragingForage`)
                        .inputs([])
                        .outputs([items.food(1)])
                        .amount(1)
                        .complete()
                ])
                .unlockConditions([unlock(items.food(), "atleast", 1)])
                .complete(),
        ]
    )
}