import { useMemo, FC } from "react";
import { useTranslation } from "react-i18next";

import { IMAGE_TYPE } from "image-editor";

import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Switch from "@mui/material/Switch/Switch";

import { LIBRARY_FILE_TYPE } from "../../../../../../enums";
import useImageEdit from "./hooks";
import { IMAGE_TYPES, SCALE_MARKS, STYLES, ZOOM_STEP } from "./constants";
import { FieldOption, LibraryFile } from "../../../../../../types";
import { ButtonGroup, SelectField } from "../../../../../../shared-components";
import { SCALE_VALUE } from "./enums";

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

  const imageTypeOptions = useMemo<FieldOption[]>(
    () => IMAGE_TYPES.map((value) => ({ ...value, label: t(value.label) })),
    [t],
  );

  return (
    <Paper elevation={2} sx={STYLES.MODAL_ROOT}>
      <Stack
        height="100%"
        width="100%"
        gap={1}
        maxHeight="100%"
        overflow="hidden"
      >
        <Typography variant="h5">
          {t("preview.singleFile.edit.image.modal.title")}
        </Typography>
        <Stack flex={1} direction="row" overflow="hidden">
          <Box flex={1} height="100%" overflow="hidden" ref={canvasWrapperRef}>
            <Box
              component="canvas"
              width="100%"
              height="100%"
              ref={canvasRef}
            />
          </Box>
          <Stack
            width={256}
            height="100%"
            paddingLeft={2}
            paddingTop={1}
            gap={1}
          >
            <SelectField
              label={t("preview.singleFile.edit.image.modal.type.label")}
              id="imageType"
              options={imageTypeOptions}
              value={type}
              onChange={handleChangeType}
              disabled={isProcessing}
            />
            {type === IMAGE_TYPE.QUAD && (
              <FormControlLabel
                disabled={isProcessing}
                onClick={handleToggleBorder}
                control={<Switch checked={isFixBorder} />}
                label="Add 1px padding"
              />
            )}
          </Stack>
        </Stack>
        <Stack gap={1} direction="row" height={48} alignItems="center">
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
          <ButtonGroup
            flex={1}
            actions={footerActions}
            onClick={handleAction}
            dividerIndex={1}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ModalContent;
