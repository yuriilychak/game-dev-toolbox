import { IMAGE_TYPE } from "image-editor";

import { SxProps } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import FolderIcon from "@mui/icons-material/Folder";
import TextureIcon from "@mui/icons-material/Texture";
import WarningIcon from "@mui/icons-material/Warning";
import RectangleIcon from "@mui/icons-material/Rectangle";
import PolylineIcon from "@mui/icons-material/Polyline";
import Grid4x4Icon from "@mui/icons-material/Grid4x4";

import { IconMap, LocaleMap } from "./types";
import { LIBRARY_FILE_TYPE } from "./enums";

export const ROOT_ID: string = "__REACT_ARBORIST_INTERNAL_ROOT__";

export const LIBRARY_ITEM_TYPE_LOCALES: LocaleMap<LIBRARY_FILE_TYPE> = new Map([
  [LIBRARY_FILE_TYPE.IMAGE, "fileType.image"],
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, "fileType.textureAtlas"],
  [LIBRARY_FILE_TYPE.FOLDER, "fileType.folder"],
  [LIBRARY_FILE_TYPE.NONE, "fileType.none"]
]);

export const IMAGE_TYPE_LOCALES: LocaleMap<IMAGE_TYPE> = new Map([
  [IMAGE_TYPE.QUAD, "imageType.quad"],
  [IMAGE_TYPE.POLYGON, "imageType.polygon"],
  [IMAGE_TYPE.MESH, "imageType.mesh"]
]);

export const LIBRARY_ITEM_ICONS: IconMap<LIBRARY_FILE_TYPE> = new Map([
  [LIBRARY_FILE_TYPE.FOLDER, FolderIcon],
  [LIBRARY_FILE_TYPE.IMAGE, ImageIcon],
  [LIBRARY_FILE_TYPE.TEXTURE_ATLAS, TextureIcon],
  [LIBRARY_FILE_TYPE.NONE, WarningIcon]
]);

export const IMAGE_TYPE_ICONS: IconMap<IMAGE_TYPE> = new Map([
  [IMAGE_TYPE.QUAD, RectangleIcon],
  [IMAGE_TYPE.POLYGON, PolylineIcon],
  [IMAGE_TYPE.MESH, Grid4x4Icon]
]);

export const GLOBAL_STYLES: Record<string, SxProps> = {
  "*": {
    scrollbarColor: "white rgba(0, 0, 0, 0)",
    scrollbarWidth: "thin"
  },
  body: {
    fontFamily: "Arial",
    width: "100vw",
    height: "100vh",
    margin: 0,
    background: "black"
  },
  "#app": {
    width: "100vw",
    height: "100vh",
    background: "black"
  }
};
