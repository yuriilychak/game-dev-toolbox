import { LIBRARY_FILE_TYPE } from "./enums";

import SvgIcon from "@mui/material/SvgIcon";
import ImageIcon from "@mui/icons-material/Image";
import FolderIcon from "@mui/icons-material/Folder";
import TextureIcon from "@mui/icons-material/Texture";
import WarningIcon from "@mui/icons-material/Warning";

export const ROOT_ID: string = "__REACT_ARBORIST_INTERNAL_ROOT__";

export const LIBRARY_ITEM_TYPE_LOCALES: Map<LIBRARY_FILE_TYPE, string> =
  new Map([
    [LIBRARY_FILE_TYPE.IMAGE, "fileType.image"],
    [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, "fileType.textureAtlas"],
    [LIBRARY_FILE_TYPE.FOLDER, "fileType.folder"],
    [LIBRARY_FILE_TYPE.NONE, "fileType.none"],
  ]);

export const LIBRARY_ITEM_ICONS: Map<LIBRARY_FILE_TYPE, typeof SvgIcon> =
  new Map([
    [LIBRARY_FILE_TYPE.FOLDER, FolderIcon],
    [LIBRARY_FILE_TYPE.IMAGE, ImageIcon],
    [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, TextureIcon],
    [LIBRARY_FILE_TYPE.NONE, WarningIcon],
  ]);

export const GLOBAL_STYLES = {
  "*": {
    scrollbarColor: "white rgba(0, 0, 0, 0)",
    scrollbarWidth: "thin",
  },
  body: {
    fontFamily: "Arial",
    width: "100vw",
    height: "100vh",
    margin: 0,
    background: "black",
  },
  "#app": {
    width: "100vw",
    height: "100vh",
    background: "black",
  },
};
