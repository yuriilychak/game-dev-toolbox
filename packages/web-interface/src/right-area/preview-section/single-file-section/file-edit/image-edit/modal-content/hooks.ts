import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useReducer,
} from "react";
import { LibraryFile } from "../../../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../../../enums";
import { IMAGE_EDITOR_ACTION, REDUCER_ACTION } from "./enums";
import reducer from "./reducer";
import { INITIAL_STATE } from "./constants";

export default function useImageEdit(
  file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
  onClose: () => void,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { type, scale, boundEditor, isChanged, isFixBorder, isProcessing } =
    state;

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

  const handleMouseWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      handleDispatch(REDUCER_ACTION.MOUSE_ZOOM, event.deltaY);
    },
    [handleDispatch],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    handleDispatch(REDUCER_ACTION.INIT, file);
    boundEditor.init(file, canvasRef, handleProcessFinish);

    return boundEditor.destroy.bind(boundEditor);
  }, [file, boundEditor, handleDispatch, handleProcessFinish]);

  useEffect(() => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      canvas.addEventListener("wheel", handleMouseWheel);
    }, 100);

    const canvas = canvasRef.current;

    return () => {
      canvas && canvas.removeEventListener("wheel", handleMouseWheel);
    };
  }, [handleMouseWheel]);

  const handleScaleChange = useCallback(
    (event: Event, value: number) =>
      handleDispatch(REDUCER_ACTION.CHANGE_SCALE, value),
    [],
  );

  const handleChangeType = useCallback(
    (rawValue: string) => handleDispatch(REDUCER_ACTION.CHANGE_TYPE, rawValue),
    [handleDispatch],
  );

  const handleAction = useCallback(
    (action: IMAGE_EDITOR_ACTION) => {
      switch (action) {
        case IMAGE_EDITOR_ACTION.CANCEL:
          onClose();
          break;
        case IMAGE_EDITOR_ACTION.SUBMIT:
          onClose();
          break;
        case IMAGE_EDITOR_ACTION.RESET:
          handleDispatch(REDUCER_ACTION.RESET);
          break;
      }
    },
    [boundEditor, onClose],
  );

  const handleToggleBorder = useCallback(
    () => handleDispatch(REDUCER_ACTION.TOGGLE_FIX_BORDER),
    [handleDispatch],
  );

  const handleValueText = useCallback(
    (value: number): string => `${Math.round(value * 100)}%`,
    [],
  );

  return {
    isChanged,
    isFixBorder,
    isProcessing,
    canvasRef,
    canvasWrapperRef,
    scale,
    type,
    handleScaleChange,
    handleChangeType,
    handleAction,
    handleToggleBorder,
    handleValueText,
  };
}
