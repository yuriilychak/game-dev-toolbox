import { LIBRARY_ACTION } from "../../../enums";
import type { ButtonGroupAction } from "../../../shared-components";

export const FOOTER_ACTIONS: ButtonGroupAction<LIBRARY_ACTION>[] = [
  {
    locale: "library.action.submit",
    action: LIBRARY_ACTION.SUBMIT,
    variant: "contained",
    disabled: false,
  },
  {
    locale: "library.action.cancel",
    action: LIBRARY_ACTION.CANCEL,
    variant: "outlined",
    disabled: false,
  },
];
