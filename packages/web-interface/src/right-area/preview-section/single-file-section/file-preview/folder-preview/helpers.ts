import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { LibraryFile } from "../../../../../types";

export const getFolderStatistic = (
  files: LibraryFile[],
  accumulator: { childCount: number; size: number } = {
    childCount: 0,
    size: 0
  }
): { childCount: number; size: number } =>
  files.reduce((result, file) => {
    switch (file.type) {
      case LIBRARY_FILE_TYPE.FOLDER:
        return getFolderStatistic(file.children, result);
      case LIBRARY_FILE_TYPE.IMAGE:
      case LIBRARY_FILE_TYPE.TEXTURE_ATLAS:
        ++result.childCount;
        result.size += file.data.size;

        return result;
      default:
        return result;
    }
  }, accumulator);
