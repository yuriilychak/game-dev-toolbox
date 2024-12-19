import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { LibraryFile } from "../../../../../types";

export function filterTree(tree: LibraryFile[]): LibraryFile[] {
  if (tree.length === 0) {
    return tree;
  }

  const result: LibraryFile[] = [];
  let children: LibraryFile[] = null;

  for (const file of tree) {
    switch (file.type) {
      case LIBRARY_FILE_TYPE.IMAGE:
        result.push(file);
        break;
      case LIBRARY_FILE_TYPE.FOLDER:
        children = filterTree(file.children);

        if (children.length !== 0) {
          result.push({ ...file, children });
        }

        break;
      default:
    }
  }

  return result;
}
