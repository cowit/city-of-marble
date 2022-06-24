import { conversion } from "../conversions.js";
import { module, ModuleExporter } from "../module.js";
export const diplomacy = (items) => {
    return new ModuleExporter("diplomacy", [
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
            .complete(),
        module(`diploLand`)
            .name(`Land Dispute`)
            .description(`Resolve a land dispute in your favor, increasing the land under your control.`)
            .button(`trigger`, `Settle Dispute`, conversion(`landDispute`)
            .inputs([items.diplomaticFavor(25)])
            .outputs([items.land(1)])
            .complete())
            .complete()
    ]);
};
//# sourceMappingURL=diplomacy.js.map