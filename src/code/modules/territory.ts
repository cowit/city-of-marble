import { conversion } from "../conversions.js";
import { Items } from "../data/items.js";
import { module, ModuleExporter } from "../module.js";

export const territory = (items: Items) => {
    return new ModuleExporter(
        "territory",
        [
            module()
                .id("explore")
                .name("Exploring")
                .description(`You are a small group of hunter-gatherers trying to survive and grow.
                <br>(Click the button below to forage for some food and explore the land.)`)
                .conversions([])
                .button("trigger", "Explore for more land to forage",
                    conversion()
                        .inputs([items.unexploredLand(1)])
                        .outputs([items.land(1), items.food(1), items.localWater(1)])
                        .complete())
                .transform(`outskirts`, 
                module()
                .name(`Outskirts`)
                .description(`Outside of the boundary of the city, mostly unprotected and uncontrolled.
                Your people travel out there to collect the things they need, it could be beneficial to have patrols protecting them.`)
                )
                .complete(),
            module()
                .id("shelter")
                .name("Set Up Camp")
                .description(`Set up temporary camps to return to.
                <br> (Each piece of land you have visited can support 1 more camp.)`)
                .button("build", "Set up another camp",
                    conversion()
                        .inputs([items.land(1)])
                        .outputs([items.housing(1)])
                        .complete())
                .button("trigger", "The beginnings of a city..",
                    conversion()
                        .inputs([items.housing(100, [], true)])
                        .complete(),
                    `city`
                )
                .transform(`city`,
                    module()
                        .name("City")
                        .description(`The largest of the encampments that was settled at a particularly fertile area has grown into a City!
                This achievement has attracted people from from all around the region.
                Your population will now grow faster and their housing will begin to get more compact with better materials being used..`)
                        .button("build", "Building more housing",
                            conversion()
                                .inputs([items.land(0.2), items.food(10)])
                                .outputs([items.housing(1)])
                                .complete()
                        )
                )
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
        ]
    )
}