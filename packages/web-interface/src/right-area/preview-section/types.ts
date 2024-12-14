import { FC } from "react";

import { LibraryFile } from "../../types";
import { LIBRARY_FILE_TYPE } from "../../enums";

export type FilesComponent<T extends LIBRARY_FILE_TYPE = LIBRARY_FILE_TYPE> =
  FC<{ files: LibraryFile<T>[] }>;
