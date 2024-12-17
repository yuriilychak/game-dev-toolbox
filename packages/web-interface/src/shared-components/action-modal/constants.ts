import { SHARED_ACTION } from "../../enums";
import { ButtonGroupAction } from "../button-group";

export const SHARED_MODAL_ACTIONS: ButtonGroupAction<SHARED_ACTION>[] = [
  {
    locale: "shared.action.submit",
    action: SHARED_ACTION.SUBMIT,
    disabled: false,
    variant: "contained",
  },
  {
    locale: "shared.action.cancel",
    action: SHARED_ACTION.CANCEL,
    disabled: false,
    variant: "outlined",
  },
];
