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
            .button("lock", `Dedicate to Expach
                 Expach's followers will give their land to you..`, conversion(`expach`)
            .inputs([items.population(10)])
            .modifier(1, `templeGod`)
            .complete())
            .button("lock", `Dedicate to Vulkus
                 Your forges will create more and stronger metals.`, conversion(`vulkus`)
            .inputs([items.population(10)])
            .modifier(2, `templeGod`)
            .modifier(1, `forgeEfficiency`)
            .complete())
            .button("lock", `Dedicate to Civine
                 Your citizens will prosper in abundant housing and food.`, conversion(`civine`)
            .inputs([items.population(10)])
            .modifier(3, `templeGod`)
            .modifier(1, `housingLandCost`)
            .complete())
            .unlockConditions([unlock(items.temple(), "atleast", 100)], [`templeConstruction`])
            .complete(),
        module(`expachTemple`)
            .name(`Temple of Expach`)
            .description(`The temple dedicated to the god of expansion and bountiful land.
                As their followers worship them, others will start to slowly cede land to their celestial commander.`)
            .conversions([
            conversion(`influentialGrowth`)
                .amount(1)
                .inputs([items.labor(5)])
                .outputs([items.land(0.01)])
                .complete()
        ])
            .unlockConditions([unlock(modi(`templeGod`), "equals", 1)], [`dedicateTemple`])
            .complete(),
        module(`vulkusTemple`)
            .name(`Temple of Vulkus`)
            .description(`The temple dedicated to the god of the forge and metals.
                Your forges will produce more metals. Sacrifice Wood for a burst of Metals.`)
            .button("trigger", "Devote Wood", conversion("vulkusSacrifice")
            .amount(1)
            .inputs([items.wood(20)])
            .outputs([items.metal(5)])
            .complete())
            .unlockConditions([unlock(modi(`templeGod`), "equals", 2)], [`dedicateTemple`])
            .complete(),
        module(`civineTemple`)
            .name(`Temple of Civine`)
            .description(`The temple dedicated to the god of the citizenry.
                The followers will build more compact housing and consume less food.
                `)
            .unlockConditions([unlock(modi(`templeGod`), "equals", 3)], [`dedicateTemple`])
            .complete()
    ]);
};
//# sourceMappingURL=temple.js.map