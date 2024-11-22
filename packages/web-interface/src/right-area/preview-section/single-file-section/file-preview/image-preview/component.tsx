import { memo, useRef, useState, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";

import { formatSize } from "../../../../../helpers";
import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { StatisticsContainer } from "../statistics-container";
import { PREVIEW_CHECKER } from "../../../constants";

const ImagePreview: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = ({
  file,
}) => {
  const [isCanvasLoaded, setCanvasLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCanvasStatus = useCallback(() => {
    if (canvasRef.current === null) {
      setTimeout(handleCanvasStatus, 100);
    } else {
      setCanvasLoaded(true);
    }
  }, []);

  useEffect(() => {
    handleCanvasStatus();
  }, [handleCanvasStatus]);

  useEffect(() => {
    if (isCanvasLoaded) {
      const canvas = canvasRef.current;
      const context = canvasRef.current.getContext("2d");
      const imageScale = Math.min(
        (canvas.width - 8) / file.data.src.width,
        (canvas.height - 8) / file.data.src.height,
      );
      const imageWidth = Math.round(file.data.src.width * imageScale);
      const imageHeight = Math.round(file.data.src.height * imageScale);
      const imageX = (canvas.width - imageWidth) >> 1;
      const imageY = (canvas.height - imageHeight) >> 1;

      context.fillStyle = context.createPattern(PREVIEW_CHECKER, "repeat");
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(file.data.src, imageX, imageY, imageWidth, imageHeight);
    }
  }, [isCanvasLoaded, file.data.src]);

  return (
    <StatisticsContainer
      messages={[
        `Format: ${file.data.extension}`,
        `Size: ${formatSize(file.data.size)}`,
        `Width: ${file.data.src.width}px`,
        `Height: ${file.data.src.height}px`,
      ]}
    >
      <Box component="canvas" width="100%" height={128} ref={canvasRef} />
    </StatisticsContainer>
  );
};

export default memo(ImagePreview);
