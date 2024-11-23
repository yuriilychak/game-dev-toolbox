import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useReducer,
} from "react";
import { LibraryFile } from "../../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { IMAGE_EDITOR_ACTION, REDUCER_ACTION } from "./enums";
import reducer from "./reducer";
import { INITIAL_STATE } from "./constants";

export default function useImageEdit(
  file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    type,
    scale,
    boundEditor,
    isModalOpen,
    isChanged,
    isFixBorder,
    isProcessing,
  } = state;

  const handleDispatch = useCallback(
    (type: REDUCER_ACTION, payload?: unknown) => dispatch({ type, payload }),
    [dispatch],
  );

  const handleResize = useCallback(() => {
    const { width, height } = canvasWrapperRef.current.getBoundingClientRect();

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    boundEditor.render();
  }, [boundEditor]);

  const handleProcessFinish = useCallback(
    () => handleDispatch(REDUCER_ACTION.FINISH_PROCESSING),
    [handleDispatch],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    if (isModalOpen) {
      handleDispatch(REDUCER_ACTION.INIT, file);
      boundEditor.init(file, canvasRef, handleProcessFinish);
    }

    return boundEditor.destroy.bind(boundEditor);
  }, [file, isModalOpen, boundEditor, handleDispatch, handleProcessFinish]);

  const handleScaleChange = useCallback(
    (event: Event, value: number) =>
      handleDispatch(REDUCER_ACTION.CHANGE_SCALE, value),
    [],
  );

  const handleOpenModal = useCallback(
    () => handleDispatch(REDUCER_ACTION.OPEN_MODAL),
    [handleDispatch],
  );

  const handleChangeType = useCallback(
    (rawValue: string) => handleDispatch(REDUCER_ACTION.CHANGE_TYPE, rawValue),
    [handleDispatch],
  );

  const handleAction = useCallback(
    (action: IMAGE_EDITOR_ACTION) => {
      switch (action) {
        case IMAGE_EDITOR_ACTION.CANCEL:
          handleDispatch(REDUCER_ACTION.CLOSE_MODAL);
          break;
        case IMAGE_EDITOR_ACTION.SUBMIT:
          handleDispatch(REDUCER_ACTION.CLOSE_MODAL);
          break;
        case IMAGE_EDITOR_ACTION.RESET:
          handleDispatch(REDUCER_ACTION.RESET);
          break;
      }
    },
    [boundEditor],
  );

  const handleToggleBorder = useCallback(
    () => handleDispatch(REDUCER_ACTION.TOGGLE_FIX_BORDER),
    [handleDispatch],
  );

  return {
    isChanged,
    isFixBorder,
    isModalOpen,
    isProcessing,
    canvasRef,
    canvasWrapperRef,
    scale,
    type,
    handleScaleChange,
    handleOpenModal,
    handleChangeType,
    handleAction,
    handleToggleBorder,
  };
}
