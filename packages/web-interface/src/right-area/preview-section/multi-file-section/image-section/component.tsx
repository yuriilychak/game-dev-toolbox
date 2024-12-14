import { useMemo, useEffect, useState, useCallback, useContext } from "react";
import { IMAGE_TYPE, transformImageData } from "image-editor";
import type { ImageTransformWorkerResult } from "image-editor";

import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { FilesComponent } from "../../types";
import { getImageType, transformFiles, updateFiles } from "./helpers";
import { ImageParams } from "../../shared";
import { PreviewContext } from "../../../../contexts";

const ImageSection: FilesComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ files }) => {
  const { onFilesChanged } = useContext(PreviewContext);
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
      setProcessing(false);
      onFilesChanged(updateFiles(outputs, files));
    },
    [onFilesChanged, files],
  );

  const handleError = useCallback((error: ErrorEvent) => {
    console.log(error);
  }, []);

  const handleSpawn = useCallback(
    (spawned: number, completed: number) => {
      setProgress(Math.round((completed * 100) / fileCount));
    },
    [fileCount],
  );

  const handleTransform = useCallback(
    (imageType: IMAGE_TYPE, offset: number) => {
      transformImageData(
        transformFiles(files, imageType, offset),
        handleComplete,
        handleError,
        handleSpawn,
      );
    },
    [files, handleComplete, handleError, handleSpawn],
  );

  const handleChangeType = useCallback(
    (nextType: IMAGE_TYPE) => {
      setType(nextType);
      setProcessing(true);
      handleTransform(nextType, 0);
    },
    [handleTransform],
  );

  const handleToggleBorder = useCallback(() => {
    setFixBorder((prevFixBorder) => {
      handleTransform(IMAGE_TYPE.QUAD, prevFixBorder ? -1 : 1);

      return !prevFixBorder;
    });
  }, [handleTransform]);

  return (
    <ImageParams
      width="100%"
      progress={progress}
      paddingLeft={1}
      paddingRight={1}
      isProcessing={isProcessing}
      isFixBorder={isFixBorder}
      type={type}
      onChangeBorder={handleToggleBorder}
      onChangeType={handleChangeType}
    />
  );
};

export default ImageSection;
