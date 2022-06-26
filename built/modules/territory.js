import { conversion } from "../conversions.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";
export const territory = (items) => {
    return new ModuleExporter("territory", [
        module(`explore`)
            .name("Exploring")
            .description(`You are a small group of hunter-gatherers trying to survive and grow.
                <br>(Click the button below to forage for some food and explore the land.)`)
            .conversions([])
            .button("trigger", "Explore for more land to forage", conversion(`exploreButton`)
            .inputs([items.unexploredLand(1)])
            .outputs([items.land(1), items.localWater(1), items.wood(1)])
            .modifier(1, `exploredLand`)
            .complete())
            .transform(`outskirts`, module(`outskirts`)
            .name(`Outskirts`)
            .description(`Outside of the boundary of the city, mostly unprotected and uncontrolled.
                Your people travel out there to collect the things they need, it could be beneficial to have patrols protecting them.`)
            .conversions([
            conversion(`outskirtsWood`)
                .amount(1)
                .inputs([items.labor(5), items.metal(0, [modi(`metalTools`, 0.05)])])
                .outputs([items.wood(1, [modi(`outskirtPatrols`, 0.5), modi(`metalTools`, 0.5)])])
                .complete()
        ])
            .button(`build`, `Increase lumber outposts`, conversion(`buildLumberOutpost`)
            .inputs([items.labor(20)])
            .complete())
            .button("trigger", `Arm more patrols`, conversion(`outskirtPatrolsButton`)
            .inputs([items.labor(10), items.metal(10)])
            .modifier(`completions`, `outskirtPatrols`)
            .complete())
            .unlockConditions([unlock(items.unexploredLand(), "equals", 0)]))
            .complete(),
        module(`shelter`)
            .name("Set Up Camp")
            .description(`Set up temporary camps to return to.
                <br> (Each piece of land you have visited can support 1 more camp.)`)
            .unlockConditions([unlock(items.land(), "atleast", 5)])
            .button("build", "Set up another camp", conversion(`setUpAnotherCamp`)
            .inputs([items.land(1), items.wood(5)])
            .outputs([items.housing(1)])
            .modifier(`completions`, `campLevel`)
            .complete())
            .button("trigger", "The beginnings of a city..", conversion(`startCity`)
            .inputs([items.housing(20, [], true)])
            .complete(), `city`)
            .transform(`city`, module(`city`)
            .name(`City`)
            .description(`The largest of the encampments that was settled at a particularly fertile area has grown into a City!
                This achievement has attracted people from from all around the region.
                Your population will now grow faster and their housing will begin to get more compact with better materials being used..`)
            .button("build", "Building more housing", conversion(`cityBuildHouse`)
            .inputs([items.land(0.2), items.wood(5)])
            .outputs([items.housing(1)])
            .modifier(`completions`, `cityLevel`)
            .complete()))
            .complete(),
        module(`populationGrowth`)
            .name("Growing Population")
            .description(`Your group is beginning to grow now.
                 As your population grows you will will be able to have a larger workforce.
                 Build more housing to increase the rate you can use labor.`)
            .unlockConditions([unlock(items.housing(), "atleast", 1)])
            .conversions([
            conversion(`popGrowthPops`)
                .inputs([])
                .outputs([items.population(0.1, [modi(`cityLevel`, 0.1)])])
                .amount(1)
                .hideButtons()
                .complete(),
            conversion(`popGrowthWorkForce`)
                .inputs([items.food(1)])
                .outputs([items.labor(1, [modi(`cityLevel`), modi(`campLevel`, 0.2)])])
                .amount(1)
                .complete()
        ])
            .complete()
    ]);
};
//# sourceMappingURL=territory.js.map