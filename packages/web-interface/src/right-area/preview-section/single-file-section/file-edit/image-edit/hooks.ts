import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BoundEditor, IMAGE_TYPE } from "image-editor";
import { LibraryFile } from "../../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { IMAGE_EDITOR_ACTIONS } from "./enums";

export default function useImageEdit(
  file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
) {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [type, setType] = useState<IMAGE_TYPE>(file.data.type);
  const [scale, setScale] = useState<number>(1);
  const [isChanged, setChanged] = useState<boolean>(false);
  const [isFixBorder, setFixBorder] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boundEditor = useMemo(() => new BoundEditor(), []);

  const handleResize = useCallback(() => {
    const { width, height } = canvasWrapperRef.current.getBoundingClientRect();

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    boundEditor.render();
  }, [boundEditor]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    boundEditor.scale = scale;
  }, [boundEditor, scale]);

  useLayoutEffect(() => {
    if (isModalOpen) {
      boundEditor.init(file, canvasRef);
    }

    return boundEditor.destroy.bind(boundEditor);
  }, [file, isModalOpen, boundEditor]);

  const handleScaleChange = useCallback(
    (event: Event, value: number) => setScale(value),
    [],
  );

  const handleProcessFinish = useCallback(() => setProcessing(false), []);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);

  const handleChangeType = useCallback(
    (rawValue: string) => setType(parseInt(rawValue) as IMAGE_TYPE),
    [],
  );

  const handleAction = useCallback(
    (action: IMAGE_EDITOR_ACTIONS) => {
      switch (action) {
        case IMAGE_EDITOR_ACTIONS.CANCEL:
          setModalOpen(false);
          break;
        case IMAGE_EDITOR_ACTIONS.SUBMIT:
          setModalOpen(false);
          break;
        case IMAGE_EDITOR_ACTIONS.RESET:
          boundEditor.resetTransform();
          setScale(1);
          break;
        case IMAGE_EDITOR_ACTIONS.GENERATE:
          boundEditor.generatePolygon();
          break;
      }
    },
    [boundEditor],
  );

  const handleToggleBorder = useCallback(
    () =>
      setFixBorder((prevFixBorder) => {
        const nextFixBorder = !prevFixBorder;

        setProcessing(true);
        setChanged(file.data.isFixBorder !== nextFixBorder);

        boundEditor.fixQuadBorder(nextFixBorder, handleProcessFinish);

        return nextFixBorder;
      }),
    [boundEditor, file, handleProcessFinish],
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
