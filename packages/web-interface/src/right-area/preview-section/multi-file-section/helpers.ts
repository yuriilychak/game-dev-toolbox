import { LIBRARY_FILE_TYPE } from "../../../enums";
import { LibraryFile } from "../../../types";

export function getFilesType(files: LibraryFile[]): LIBRARY_FILE_TYPE {
  const fileCount: number = files.length;

  switch (fileCount) {
    case 0:
      return LIBRARY_FILE_TYPE.NONE;
    case 1:
      return files[0].type;
    default: {
      const result = files[0].type;
      let i: number = 0;

      for (i = 1; i < fileCount; ++i) {
        if (files[i].type !== result) {
          return LIBRARY_FILE_TYPE.NONE;
        }
      }

      return result;
    }
  }
}
