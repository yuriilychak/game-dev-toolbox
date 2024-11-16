import { IMAGE_TYPE } from "image-editor";

import type { Mark } from "@mui/material/Slider/useSlider.types";
import { SxProps, Theme } from "@mui/material/styles";

import type { ButtonGroupAction } from "../../../../../shared-components";
import type { FieldOption } from "../../../../../types";
import { IMAGE_EDITOR_ACTIONS } from "./enums";
import { IMAGE_TYPE_ICONS, IMAGE_TYPE_LOCALES } from "../../../../../constants";

export const SCALE_MARKS: Mark[] = [
  { value: 0.1, label: "10%" },
  { value: 1, label: "100%" },
  { value: 4, label: "400%" },
];

export const STYLES: Record<string, SxProps<Theme>> = {
  MODAL: { display: "flex", alignItems: "center", justifyContent: "center" },
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

export const FOOTER_ACTIONS: ButtonGroupAction<IMAGE_EDITOR_ACTIONS>[] = [
  {
    action: IMAGE_EDITOR_ACTIONS.RESET,
    locale: "preview.singleFile.edit.image.modal.button.reset",
    variant: "contained",
  },
  {
    action: IMAGE_EDITOR_ACTIONS.SUBMIT,
    locale: "preview.singleFile.edit.image.modal.button.submit",
    variant: "contained",
  },
  {
    action: IMAGE_EDITOR_ACTIONS.CANCEL,
    locale: "preview.singleFile.edit.image.modal.button.cancel",
    variant: "outlined",
  },
];

const QUAD_ACTIONS: ButtonGroupAction<IMAGE_EDITOR_ACTIONS>[] = [
  {
    action: IMAGE_EDITOR_ACTIONS.CROP,
    locale: "preview.singleFile.edit.image.modal.button.crop",
    variant: "contained",
  },
];

const POLYGON_ACTIONS: ButtonGroupAction<IMAGE_EDITOR_ACTIONS>[] = [
  {
    action: IMAGE_EDITOR_ACTIONS.GENERATE,
    locale: "preview.singleFile.edit.image.modal.button.generate",
    variant: "contained",
  },
  {
    action: IMAGE_EDITOR_ACTIONS.EDIT,
    locale: "preview.singleFile.edit.image.modal.button.edit",
    variant: "contained",
  },
];

export const TYPE_ACTIONS: Map<
  IMAGE_TYPE,
  ButtonGroupAction<IMAGE_EDITOR_ACTIONS>[]
> = new Map([
  [IMAGE_TYPE.QUAD, QUAD_ACTIONS],
  [IMAGE_TYPE.POLYGON, POLYGON_ACTIONS],
  [IMAGE_TYPE.MESH, []],
  [IMAGE_TYPE.NONE, []],
]);
