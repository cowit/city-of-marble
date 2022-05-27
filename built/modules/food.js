import { modi } from "../modifiers.js";
import { conversion } from "../conversions.js";
import { module, ModuleExporter } from "../module.js";
export const foraging = (items, globalModifiers) => {
    return new ModuleExporter("foraging", [
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
            .button("trigger", `Plant seeds`, conversion()
            .inputs([items.food(1)])
            .outputs([])
            .complete(), `fullFarming`)
            .transform("fullFarming", module()
            .name("Farming")
            .description(`Your people have begun to reap what they sowed previously.  
                        This years growth in the area that you planted the seeds has grown better than any other.`)
            .conversions([
            conversion()
                .inputs([items.workForce(4, [modi(`irrigation`)])])
                .outputs([items.food(4, [modi(`irrigation`)])])
                .complete()
        ])
            .button("build", "Sow more land", conversion()
            .inputs([items.land(1)])
            .complete()))
            .complete(),
        module()
            .id("basicIrrigation")
            .name("Basic Irrigation")
            .description(`Your people have started to notice that the best growing crops are grouped around the ponds and streams.
            Some have made small trenches for the water to flow deeper in towards the crops.`)
            .button("build", "Invest in digging more trenches", conversion()
            .inputs([items.localWater(1, [modi(`irrigation`, 0.5)])])
            .modifier(`completions`, `irrigation`)
            .complete())
            .complete()
    ]);
};
//# sourceMappingURL=food.js.map