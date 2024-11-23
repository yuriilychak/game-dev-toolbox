import { BoundEditor, IMAGE_TYPE } from "image-editor";
import { REDUCER_ACTION } from "./enums";

export type ReducerState = {
  type: IMAGE_TYPE;
  scale: number;
  isChanged: boolean;
  isFixBorder: boolean;
  isProcessing: boolean;
  boundEditor: BoundEditor;
};

export type ReducerMiddleware = (
  prevState: ReducerState,
  payload: unknown,
) => ReducerState;

export type ReducerAction = {
  type: REDUCER_ACTION;
  payload: unknown;
};
