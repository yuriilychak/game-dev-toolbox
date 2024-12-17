import { FC } from "react";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";

import { LIBRARY_FILE_TYPE } from "../../../../../../enums";
import { SCALE_MARKS, STYLES, ZOOM_STEP } from "./constants";
import { LibraryFile } from "../../../../../../types";
import { ActionModal } from "../../../../../../shared-components";
import { ImageParams } from "../../../../shared";
import { SCALE_VALUE } from "./enums";
import useImageEdit from "./hooks";

const ModalContent: FC<{
  file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>;
  onClose(): void;
}> = ({ file, onClose }) => {
  const { t } = useTranslation();
  const {
    footerActions,
    scale,
    type,
    isProcessing,
    isFixBorder,
    canvasRef,
    canvasWrapperRef,
    handleScaleChange,
    handleChangeType,
    handleAction,
    handleToggleBorder,
    handleValueText,
  } = useImageEdit(file, onClose);

  return (
    <ActionModal
      open
      width="95vw"
      height="95vh"
      dividerIndex={1}
      fotterContent={
        <Stack direction="row" gap={1} sx={STYLES.SCALE_CONTAINER}>
          <Typography sx={STYLES.SCALE_LABEL}>
            {t("preview.singleFile.edit.image.modal.label.scale")}
          </Typography>
          <Slider
            size="small"
            min={SCALE_VALUE.MIN}
            max={SCALE_VALUE.MAX}
            onChange={handleScaleChange}
            value={scale}
            getAriaValueText={handleValueText}
            step={ZOOM_STEP}
            valueLabelDisplay="auto"
            marks={SCALE_MARKS}
          />
        </Stack>
      }
      title={t("preview.singleFile.edit.image.modal.title")}
      actions={footerActions}
      onAction={handleAction}
    >
      <Stack flex={1} direction="row" overflow="hidden">
        <Box flex={1} height="100%" overflow="hidden" ref={canvasWrapperRef}>
          <Box component="canvas" width="100%" height="100%" ref={canvasRef} />
        </Box>
        <ImageParams
          width={256}
          paddingLeft={2}
          paddingRight={0}
          onChangeBorder={handleToggleBorder}
          type={type}
          isFixBorder={isFixBorder}
          isProcessing={isProcessing}
          onChangeType={handleChangeType}
        />
      </Stack>
    </ActionModal>
  );
};

export default ModalContent;
