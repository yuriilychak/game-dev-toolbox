import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useReducer,
  useMemo,
  useContext,
} from "react";
import { LibraryFile } from "../../../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../../../enums";
import { IMAGE_EDITOR_ACTION, REDUCER_ACTION } from "./enums";
import reducer from "./reducer";
import { FOOTER_ACTIONS, INITIAL_STATE } from "./constants";
import { PreviewContext } from "../../../../../../contexts";
import { IMAGE_TYPE } from "image-editor";

export default function useImageEdit(
  file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
  onClose: () => void,
) {
  const { onFilesChanged, onProcessing } = useContext(PreviewContext);
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { type, scale, boundEditor, isChanged, isFixBorder, isProcessing } =
    state;

  const footerActions = useMemo(
    () =>
      FOOTER_ACTIONS.map((action) => ({
        ...action,
        disabled:
          (action.action !== IMAGE_EDITOR_ACTION.RESET && isProcessing) ||
          (action.action === IMAGE_EDITOR_ACTION.SUBMIT && !isChanged),
      })),
    [isChanged, isProcessing],
  );

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
    (value: IMAGE_TYPE) => {
      onProcessing();
      handleDispatch(REDUCER_ACTION.CHANGE_TYPE, value);
    },
    [handleDispatch, onProcessing],
  );

  const handleAction = useCallback(
    (action: IMAGE_EDITOR_ACTION) => {
      switch (action) {
        case IMAGE_EDITOR_ACTION.CANCEL:
          onClose();
          break;
        case IMAGE_EDITOR_ACTION.SUBMIT:
          onFilesChanged([boundEditor.export()]);
          onClose();
          break;
        case IMAGE_EDITOR_ACTION.RESET:
          handleDispatch(REDUCER_ACTION.RESET);
          break;
      }
    },
    [onFilesChanged, boundEditor, onClose],
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
    footerActions,
    scale,
    type,
    handleScaleChange,
    handleChangeType,
    handleAction,
    handleToggleBorder,
    handleValueText,
  };
}
