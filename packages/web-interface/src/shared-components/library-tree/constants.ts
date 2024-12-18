import { SxProps } from "@mui/material/styles";

import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { IconMap } from "../../types";
import { LIBRARY_ACTION } from "../../enums";

export const LIBRARY_ACTION_ICONS: IconMap<LIBRARY_ACTION> = new Map([
  [LIBRARY_ACTION.ADD_FILE, NoteAddIcon],
  [LIBRARY_ACTION.ADD_FOLDER, CreateNewFolderIcon],
  [LIBRARY_ACTION.DELETE, DeleteIcon],
  [LIBRARY_ACTION.RENAME, EditIcon],
  [LIBRARY_ACTION.SUBMIT, CheckIcon],
  [LIBRARY_ACTION.CANCEL, CloseIcon],
]);

export const ACTION_TO_LOCALE: Map<LIBRARY_ACTION, string> = new Map([
  [LIBRARY_ACTION.ADD_FILE, "library.action.addFile"],
  [LIBRARY_ACTION.ADD_FOLDER, "library.action.addFolder"],
  [LIBRARY_ACTION.RENAME, "library.action.rename"],
  [LIBRARY_ACTION.DELETE, "library.action.delete"],
  [LIBRARY_ACTION.SUBMIT, "library.action.submit"],
  [LIBRARY_ACTION.CANCEL, "library.action.cancel"],
]);

export const LIBRAY_STYLES: Map<boolean, SxProps> = new Map([
  [true, { pointerEvents: "none", opacity: 0.7 }],
  [false, { pointerEvents: "unset", opacity: 1 }],
]);
