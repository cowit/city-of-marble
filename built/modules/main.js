import { conversion } from "../conversions.js";
import { module, ModuleExporter, unlock } from "../module.js";
export const main = (items) => {
    return new ModuleExporter("main", [
        module(`explore`)
            .name("Exploring")
            .description(`You are a small group of hunter-gatherers trying to survive and grow.
            <br>(Click the button below to forage for some food and explore the land.)`)
            .conversions([])
            .button("trigger", "Explore for more land to forage", conversion(`exploreButton`)
            .inputs([items.unexploredLand(1), items.food(10)])
            .outputs([items.land(1), items.localWater(1), items.wood(1)])
            .modifier(1, `exploredLand`)
            .complete())
            .unlockConditions([unlock(items.food(), "atleast", 0)])
            .complete(),
        module(`foraging`)
            .name("Foraging")
            .description(`Your people will help you forage, feeding themselves and helping others.`)
            .conversions([
            conversion(`foragingForage`)
                .inputs([])
                .outputs([items.food(4)])
                .amount(1)
                .complete()
        ])
            .complete(),
    ]);
};
//# sourceMappingURL=main.js.map