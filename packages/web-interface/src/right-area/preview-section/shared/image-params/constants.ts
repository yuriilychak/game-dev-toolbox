import { IMAGE_TYPE } from "image-editor";

import type { FieldOption } from "../../../../types";
import { IMAGE_TYPE_ICONS, IMAGE_TYPE_LOCALES } from "../../../../constants";

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
