import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { IMAGE_TYPE } from "image-editor";

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Switch from "@mui/material/Switch/Switch";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import useImageEdit from "./hooks";
import {
  FOOTER_ACTIONS,
  IMAGE_TYPES,
  SCALE_MARKS,
  STYLES,
  TYPE_ACTIONS,
} from "./constants";
import { FieldOption } from "../../../../../types";
import { ButtonGroup, SelectField } from "../../../../../shared-components";

function valueText(value: number): string {
  return `${Math.round(value * 100)}%`;
}

const ImageEdit: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ file }) => {
  const { t } = useTranslation();
  const {
    scale,
    type,
    isProcessing,
    isFixBorder,
    isModalOpen,
    canvasRef,
    canvasWrapperRef,
    handleOpenModal,
    handleScaleChange,
    handleChangeType,
    handleAction,
    handleToggleBorder,
  } = useImageEdit(file);

  const imageTypeOptions = useMemo<FieldOption[]>(
    () => IMAGE_TYPES.map((value) => ({ ...value, label: t(value.label) })),
    [t],
  );

  const typeActions = TYPE_ACTIONS.get(type);

  return (
    <>
      <Stack justifyContent="center" alignItems="center" padding={1}>
        <Button variant="contained" onClick={handleOpenModal} size="small">
          {t("preview.singleFile.edit.image.button.edit")}
        </Button>
      </Stack>
      <Modal open={isModalOpen} sx={STYLES.MODAL}>
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
              <Box
                flex={1}
                height="100%"
                overflow="hidden"
                ref={canvasWrapperRef}
              >
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
                {!!typeActions.length && (
                  <ButtonGroup
                    disabled={isProcessing}
                    actions={typeActions}
                    onClick={handleAction}
                    width="100%"
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
                  min={0.1}
                  max={4}
                  onChange={handleScaleChange}
                  value={scale}
                  getAriaValueText={valueText}
                  step={0.1}
                  valueLabelDisplay="auto"
                  marks={SCALE_MARKS}
                />
              </Stack>
              <ButtonGroup
                flex={1}
                disabled={isProcessing}
                actions={FOOTER_ACTIONS}
                onClick={handleAction}
                dividerIndex={1}
              />
            </Stack>
          </Stack>
        </Paper>
      </Modal>
    </>
  );
};

export default ImageEdit;
