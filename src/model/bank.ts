import { Organizze } from "./organizze";
import { Pluggy } from "./pluggy";

export class Bank {
    name: string;
    organizze: Organizze;
    pluggy?: Pluggy;
    default?: boolean
}