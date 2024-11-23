import { BoundEditor, IMAGE_TYPE } from "image-editor";

import type { Mark } from "@mui/material/Slider/useSlider.types";
import { SxProps, Theme } from "@mui/material/styles";

import type { ButtonGroupAction } from "../../../../../../shared-components";
import type { FieldOption } from "../../../../../../types";
import { IMAGE_EDITOR_ACTION, SCALE_VALUE } from "./enums";
import { ReducerState } from "./types";
import {
  IMAGE_TYPE_ICONS,
  IMAGE_TYPE_LOCALES,
} from "../../../../../../constants";

export const SCALE_MARKS: Mark[] = [
  SCALE_VALUE.MIN,
  SCALE_VALUE.DEFAULT,
  SCALE_VALUE.MAX,
].map((value) => ({
  value,
  label: `${value * 100}%`,
}));

export const STYLES: Record<string, SxProps<Theme>> = {
  MODAL_ROOT: {
    width: "96vw",
    height: "96vh",
    maxHeight: "96vh",
    padding: 2,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  SCALE_CONTAINER: {
    paddingBottom: 1,
    paddingRight: 2,
    width: 256,
    height: 48,
    boxSizing: "border-box",
  },
  SCALE_LABEL: { paddingTop: 0.25 },
};

const DISABLED_TYPES: IMAGE_TYPE[] = [IMAGE_TYPE.MESH];

export const IMAGE_TYPES: FieldOption[] = [
  IMAGE_TYPE.QUAD,
  IMAGE_TYPE.POLYGON,
  IMAGE_TYPE.MESH,
].map((value) => ({
  value,
  label: IMAGE_TYPE_LOCALES.get(value),
  Icon: IMAGE_TYPE_ICONS.get(value),
  disabled: DISABLED_TYPES.includes(value),
}));

export const FOOTER_ACTIONS: ButtonGroupAction<IMAGE_EDITOR_ACTION>[] = [
  {
    action: IMAGE_EDITOR_ACTION.RESET,
    locale: "preview.singleFile.edit.image.modal.button.reset",
    variant: "contained",
  },
  {
    action: IMAGE_EDITOR_ACTION.SUBMIT,
    locale: "preview.singleFile.edit.image.modal.button.submit",
    variant: "contained",
  },
  {
    action: IMAGE_EDITOR_ACTION.CANCEL,
    locale: "preview.singleFile.edit.image.modal.button.cancel",
    variant: "outlined",
  },
];

export const INITIAL_STATE: ReducerState = {
  type: IMAGE_TYPE.NONE,
  scale: SCALE_VALUE.DEFAULT,
  isChanged: false,
  isFixBorder: false,
  isProcessing: false,
  boundEditor: new BoundEditor(),
};

export const ZOOM_STEP: number = 0.1;
