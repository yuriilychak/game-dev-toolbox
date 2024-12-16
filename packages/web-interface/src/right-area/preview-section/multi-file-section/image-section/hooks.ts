import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  IMAGE_TYPE,
  ImageTransformWorkerResult,
  transformImageData,
} from "image-editor";

import { PreviewContext } from "../../../../contexts";
import { getImageType, transformFiles, updateFiles } from "./helpers";
import { LibraryFile } from "../../../../types";
import { LIBRARY_FILE_TYPE } from "../../../../enums";

export default function useImageSection(
  files: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[],
) {
  const { onFilesChanged, onProcessing } = useContext(PreviewContext);
  const initialType = useMemo(() => getImageType(files), [files]);
  const [type, setType] = useState<IMAGE_TYPE>(IMAGE_TYPE.NONE);
  const [isFixBorder, setFixBorder] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const fileCount: number = files.length;

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const handleComplete = useCallback(
    (outputs: ImageTransformWorkerResult[]) => {
      const updatedFiles = updateFiles(outputs, files);

      setProcessing(false);
      onFilesChanged(updatedFiles);
    },
    [onFilesChanged, files],
  );

  const handleError = useCallback((error: ErrorEvent) => {
    console.log(error);
  }, []);

  const handleSpawn = useCallback(
    (spawned: number, completed: number) =>
      setProgress(Math.round((completed * 100) / fileCount)),
    [fileCount],
  );

  const handleTransform = useCallback(
    (imageType: IMAGE_TYPE, offset: number) => {
      const inputFiles = transformFiles(files, imageType, offset);

      setType(imageType);
      setProcessing(true);
      onProcessing();
      transformImageData(inputFiles, handleComplete, handleError, handleSpawn);
    },
    [files, handleComplete, handleError, handleSpawn, onProcessing],
  );

  const handleChangeType = useCallback(
    (nextType: IMAGE_TYPE) => handleTransform(nextType, 0),
    [handleTransform, onProcessing],
  );

  const handleToggleBorder = useCallback(() => {
    setFixBorder((prevFixBorder) => {
      handleTransform(IMAGE_TYPE.QUAD, prevFixBorder ? -1 : 1);

      return !prevFixBorder;
    });
  }, [handleTransform]);

  return {
    type,
    progress,
    isFixBorder,
    isProcessing,
    handleChangeType,
    handleToggleBorder,
  };
}
