import { conversion } from "../conversions.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";
export const temple = (items) => {
    return new ModuleExporter("temple", "Great Buildings", [
        module(`temple`)
            .name(`Vision of The Grand Temple`)
            .description(`In your dreams you see a majestic temple made of expertly crafted stone masonry and filled to the brim with clamoring masses.
            Whether they are seeking salvation or simply a place to be, it occurs to you that it is your purpose to fulfill their desire.`)
            .button(`trigger`, `Begin constrution of The Temple`, conversion(`beginTemple`)
            .modifier(1, "templeStart")
            .complete())
            .unlockConditions([unlock(items.population(), "atleast", 50)])
            .complete(),
        module(`templeConstruction`)
            .name(`Construct The Temple`)
            .description(`Your builders lay the first stones.`)
            .conversions([
            conversion(`templeContruction`)
                .amount(1)
                .inputs([items.labor(25), items.stone(10)])
                .outputs([items.temple(1)])
                .complete()
        ])
            .unlockConditions([unlock(modi("templeStart"), "atleast", 1)], [`temple`])
            .complete(),
        module(`dedicateTemple`)
            .name(`Dedicate The Temple`)
            .description(`Dedicate your temple to a specific god which will help you in that area.`)
            .button("trigger", `Dedicate to Expach
                 You will gain bonusus when taking land.`, conversion(`expach`)
            .inputs([items.population(10)])
            .modifier(`expach`, `templeGod`)
            .complete())
            .unlockConditions([unlock(items.temple(), "atleast", 100)], [`templeConstruction`])
            .complete(),
        module(`expachTemple`)
            .name(`Temple Of Expach`)
            .description(`The temple dedicated to the god of expansion and bountiful land.
                As their followers worship them, others will start to slowly cede land to their celestial commander.`)
            .conversions([
            conversion(`influentialGrowth`)
                .inputs([items.labor(5)])
                .outputs([items.land(0.01)])
                .complete()
        ])
            .unlockConditions([unlock(modi(`templeGod`), "equals", "expach")], [`dedicateTemple`])
            .complete()
    ]);
};
//# sourceMappingURL=temple.js.map