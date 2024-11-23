import { IMAGE_TYPE } from "image-editor";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { LibraryFile } from "../../../../../types";
import { REDUCER_ACTION } from "./enums";
import { ReducerAction, ReducerMiddleware, ReducerState } from "./types";

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
      scale: 1,
    }),
  ],
  [
    REDUCER_ACTION.OPEN_MODAL,
    (prevState: ReducerState): ReducerState => ({
      ...prevState,
      isModalOpen: true,
    }),
  ],
  [
    REDUCER_ACTION.CLOSE_MODAL,
    (prevState: ReducerState): ReducerState => ({
      ...prevState,
      isModalOpen: false,
    }),
  ],
  [
    REDUCER_ACTION.RESET,
    (prevState: ReducerState): ReducerState => {
      const { boundEditor } = prevState;

      boundEditor.resetTransform();

      return { ...prevState, scale: 1 };
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
    (prevState: ReducerState, rawType: string): ReducerState => {
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
