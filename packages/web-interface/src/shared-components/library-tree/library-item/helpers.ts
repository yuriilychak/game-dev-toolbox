import { LIBRARY_FILE_TYPE, SELECTION_STATE } from "../../../enums";
import { LibraryFile } from "../../../types";

function checkSimpleFileSelection(
  file: LibraryFile,
  selectedIds: string[],
): SELECTION_STATE {
  return !selectedIds.includes(file.id)
    ? SELECTION_STATE.UNSELECTED
    : SELECTION_STATE.SELECTED;
}

function checkChildrenSelection(
  tree: LibraryFile[],
  selectedIds: string[],
): SELECTION_STATE {
  const selection = new Uint8Array(3);

  selection[0] = 1;
  selection[1] = 0;
  selection[2] = SELECTION_STATE.UNSELECTED;

  for (const file of tree) {
    selection[2] =
      file.type === LIBRARY_FILE_TYPE.FOLDER
        ? checkChildrenSelection(file.children, selectedIds)
        : checkSimpleFileSelection(file, selectedIds);

    switch (selection[2]) {
      case SELECTION_STATE.SELECTED_PARTIALY:
        return SELECTION_STATE.SELECTED_PARTIALY;
      case SELECTION_STATE.UNSELECTED:
        selection[0] = 0;
        break;
      case SELECTION_STATE.SELECTED:
        selection[1] = 1;
        break;
    }

    if (!selection[0] && selection[1]) {
      return SELECTION_STATE.SELECTED_PARTIALY;
    }
  }

  return (selection[0] + selection[1]) as SELECTION_STATE;
}

export function checkSelection(
  file: LibraryFile,
  selectedIds: string[],
): SELECTION_STATE {
  return file.type === LIBRARY_FILE_TYPE.FOLDER
    ? checkChildrenSelection(file.children, selectedIds)
    : checkSimpleFileSelection(file, selectedIds);
}

export function getChildIds(
  tree: LibraryFile[],
  result: string[] = [],
): string[] {
  for (const file of tree) {
    if (file.type !== LIBRARY_FILE_TYPE.FOLDER) {
      result.push(file.id);
    } else {
      getChildIds(file.children, result);
    }
  }

  return result;
}
