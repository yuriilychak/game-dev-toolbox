import { LIBRARY_FILE_TYPE } from "../../enums";
import { LibraryFile } from "../../types";

export function flattenFiles(
  files: LibraryFile[],
  result: LibraryFile[] = [],
): LibraryFile[] {
  const fileCount: number = files.length;
  let file: LibraryFile = null;
  let i: number = 0;

  for (i = 0; i < fileCount; ++i) {
    file = files[i];

    if (file.type !== LIBRARY_FILE_TYPE.FOLDER) {
      result.push(file);
      continue;
    }

    if (file.children.length !== 0) {
      flattenFiles(file.children, result);
    }
  }

  return result;
}
