import { conversion } from "../conversions.js";
import { Items } from "../items/items.js";
import { module, ModuleExporter } from "../module.js";

export const foraging = (items: Items) => {
    return new ModuleExporter(
        "foraging",
        [
            module()
                .id("foraging")
                .name("Foraging")
                .description(`Your people will help you forage, feeding themselves and helping others.`)
                .conversions([
                    conversion()
                        .inputs([])
                        .outputs([items.food(3)])
                        .complete()
                ])
                .complete(),
            module()
                .id("farming")
                .name("Plant Seeds")
                .description(`Plant some seeds from the most delicious crops in the muddy earth.`)
                .button("trigger", `Plant seeds`,
                    conversion()
                        .inputs([items.food(1)])
                        .outputs([])
                        .complete(),
                    `fullFarming`
                )
                .transform("fullFarming",
                    module()
                        .name("Farming")
                        .description("Your first harvest is here!")
                )
                .complete()
        ]
    )
}
