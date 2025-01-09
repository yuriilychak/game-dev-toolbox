import { LIBRARY_ACTION } from "../../../enums";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { IconMap } from "../../../types";

export const EXPAND_ICONS: IconMap<boolean> = new Map([
  [true, ExpandMoreIcon],
  [false, NavigateNextIcon]
]);

export const ITEM_ACTIONS: Map<boolean, LIBRARY_ACTION[]> = new Map([
  [true, [LIBRARY_ACTION.SUBMIT, LIBRARY_ACTION.CANCEL]],
  [false, [LIBRARY_ACTION.RENAME, LIBRARY_ACTION.DELETE]]
]);
