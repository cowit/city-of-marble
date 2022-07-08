import { conversion } from "../conversions.js";
import { modi } from "../modifiers.js";
import { module, ModuleExporter, unlock } from "../module.js";
export const diplomacy = (items) => {
    return new ModuleExporter("diplomacy", "Diplomacy", [
        module(`diplomats`)
            .name(`Foreign Friends`)
            .description(`Carouse and spend time with your foreign allies.
                Arranging marriages, fixing land disputes etc.`)
            .conversions([
            conversion(`carousing`)
                .inputs([items.labor(10)])
                .outputs([items.diplomaticFavor(1)])
                .amount(1)
                .complete()
        ])
            .unlockConditions([
            unlock(items.land(), `equals`, 0),
            unlock(items.unexploredLand(), `equals`, 0)
        ])
            .complete(),
        module(`diploLand`)
            .name(`Land Dispute`)
            .description(`Resolve a land dispute in your favor, increasing the land under your control.
                The more land you acquire this way, the harder it will be to get more using diplomacy.`)
            .button(`trigger`, `Settle Dispute`, conversion(`landDispute`)
            .inputs([items.diplomaticFavor(5, [modi(`disputes`)])])
            .outputs([items.land(1)])
            .modifier(`completions`, `disputes`)
            .complete())
            .unlockConditions([
            unlock(items.land(), `equals`, 0),
            unlock(items.unexploredLand(), `equals`, 0)
        ])
            .complete()
    ]);
};
//# sourceMappingURL=diplomacy.js.map