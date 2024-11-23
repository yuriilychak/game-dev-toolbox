import { IMAGE_TYPE } from "image-editor";

import { LIBRARY_FILE_TYPE } from "../../../../../../enums";
import { LibraryFile } from "../../../../../../types";
import { REDUCER_ACTION, SCALE_VALUE } from "./enums";
import { ReducerAction, ReducerMiddleware, ReducerState } from "./types";
import { ZOOM_STEP } from "./constants";

const REDUCER = new Map<REDUCER_ACTION, ReducerMiddleware>([
  [
    REDUCER_ACTION.INIT,
    (
      prevState: ReducerState,
      file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
    ): ReducerState => ({
      ...prevState,
      type: file.data.type,
      isFixBorder: file.data.isFixBorder,
      scale: SCALE_VALUE.DEFAULT,
    }),
  ],
  [
    REDUCER_ACTION.RESET,
    (prevState: ReducerState): ReducerState => {
      const { boundEditor } = prevState;

      boundEditor.resetTransform();

      return { ...prevState, scale: SCALE_VALUE.DEFAULT };
    },
  ],
  [
    REDUCER_ACTION.CHANGE_SCALE,
    (prevState: ReducerState, scale: number): ReducerState => {
      const { boundEditor } = prevState;

      boundEditor.scale = scale;

      return { ...prevState, scale };
    },
  ],
  [
    REDUCER_ACTION.MOUSE_ZOOM,
    (prevState: ReducerState, wheelOffset: number): ReducerState => {
      const { boundEditor, scale } = prevState;

      const nextScale = Math.min(
        Math.max(scale - Math.sign(wheelOffset) * ZOOM_STEP, SCALE_VALUE.MIN),
        SCALE_VALUE.MAX,
      );

      boundEditor.scale = nextScale;

      return { ...prevState, scale: nextScale };
    },
  ],
  [
    REDUCER_ACTION.FINISH_PROCESSING,
    (prevState: ReducerState): ReducerState => ({
      ...prevState,
      isProcessing: false,
    }),
  ],
  [
    REDUCER_ACTION.CHANGE_TYPE,
    (prevState: ReducerState, rawType: string): ReducerState => {
      const { boundEditor } = prevState;
      const type: IMAGE_TYPE = parseInt(rawType) as IMAGE_TYPE;

      boundEditor.updateType(type);

      return { ...prevState, type, isProcessing: true, isChanged: true };
    },
  ],
  [
    REDUCER_ACTION.TOGGLE_FIX_BORDER,
    (prevState: ReducerState): ReducerState => {
      const { boundEditor, isFixBorder } = prevState;
      const nextFixBorder = !isFixBorder;

      boundEditor.fixQuadBorder(nextFixBorder);

      return {
        ...prevState,
        isFixBorder: nextFixBorder,
        isProcessing: true,
        isChanged: true,
      };
    },
  ],
]);

export default function reducer(
  prevState: ReducerState,
  { type, payload }: ReducerAction,
): ReducerState {
  return REDUCER.has(type) ? REDUCER.get(type)(prevState, payload) : prevState;
}
