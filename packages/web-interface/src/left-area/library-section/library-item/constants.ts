import { LIBRARY_ACTION } from "../../../enums";

import SvgIcon from "@mui/material/SvgIcon";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const EXPAND_ICONS: Map<boolean, typeof SvgIcon> = new Map([
  [true, ExpandMoreIcon],
  [false, NavigateNextIcon],
]);

export const ITEM_ACTIONS: Map<boolean, LIBRARY_ACTION[]> = new Map([
  [true, [LIBRARY_ACTION.SUBMIT, LIBRARY_ACTION.CANCEL]],
  [false, [LIBRARY_ACTION.RENAME, LIBRARY_ACTION.DELETE]],
]);
