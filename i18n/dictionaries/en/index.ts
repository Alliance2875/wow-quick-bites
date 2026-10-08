// One file per feature: whoever owns a feature edits only its file (fewer merge conflicts).
// Adding a key in en/ without adding it in fr/ is a type error.
import { account } from "./account";
import { cart } from "./cart";
import { checkout } from "./checkout";
import { common } from "./common";
import { home } from "./home";
import { menu } from "./menu";
import { order } from "./order";
import { about, contact } from "./pages";
import { product } from "./product";

const dictionary = { common, home, menu, product, cart, checkout, order, account, about, contact };

export type Dictionary = typeof dictionary;
export default dictionary;
