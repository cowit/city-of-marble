import { conversion } from "../conversions.js";
import { module, ModuleExporter } from "../module.js";
export const territory = (items) => {
    return new ModuleExporter("territory", [
        module()
            .id("explore")
            .name("Exploring")
            .description(`You are a small group of hunter-gatherers trying to survive and grow.
                <br>(Click the button below to forage for some food and explore the land.)`)
            .conversions([])
            .button("trigger", "Explore for more land to forage", conversion()
            .inputs([items.unexploredLand(1)])
            .outputs([items.land(1), items.food(1)])
            .complete())
            .complete(),
        module()
            .id("shelter")
            .name("Set Up Camp")
            .description(`Set up temporary camps to return to.
                <br> (Each piece of land you have visited can support 1 more camp.)`)
            .button("build", "Set up another camp", conversion()
            .inputs([items.land(1)])
            .outputs([items.housing(1)])
            .complete())
            .complete(),
        module()
            .id("populationGrowth")
            .name("Growing Population")
            .description(`Your group is beginning to grow now.
                 As your population grows you will will be able to have a larger workforce.`)
            .conversions([
            conversion()
                .inputs([items.food(1)])
                .outputs([items.population(0.05)])
                .complete(),
            conversion()
                .inputs([items.food(1)])
                .outputs([items.workForce(1)])
                .complete()
        ])
            .complete()
    ]);
};
//# sourceMappingURL=territory.js.map