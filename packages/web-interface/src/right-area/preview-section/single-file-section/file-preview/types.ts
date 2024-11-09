import { FC } from "react";

import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { LibraryFile } from "../../../../types";

export type TypedPreviewComponent<
  T extends LIBRARY_FILE_TYPE = LIBRARY_FILE_TYPE,
> = FC<{
  file: LibraryFile<T>;
}>;
