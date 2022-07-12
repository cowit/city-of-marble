import { EventHandler } from "../components/events";

export interface Total<Type> {
    total(): Type,
    value: Type,
    onAmountChange: EventHandler<number>
}