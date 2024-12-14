import { FC, memo, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IMAGE_TYPE } from "image-editor";

import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Switch from "@mui/material/Switch/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

import { SelectField } from "../../../../shared-components";
import { IMAGE_TYPES } from "./constants";
import type { FieldOption } from "../../../../types";

type ImageParamsProps = {
  type: IMAGE_TYPE;
  progress?: number;
  width: number | string;
  paddingLeft?: number;
  paddingRight?: number;
  isFixBorder: boolean;
  isProcessing: boolean;
  onChangeType(value: IMAGE_TYPE): void;
  onChangeBorder(): void;
};

const ImageParams: FC<ImageParamsProps> = ({
  isProcessing,
  isFixBorder,
  width,
  progress = -1,
  paddingLeft,
  paddingRight,
  onChangeType,
  onChangeBorder,
  type,
}) => {
  const { t } = useTranslation();

  const imageTypeOptions = useMemo<FieldOption[]>(
    () => IMAGE_TYPES.map((value) => ({ ...value, label: t(value.label) })),
    [t],
  );

  const handleChangeType = useCallback(
    (value: string) => onChangeType(parseInt(value) as IMAGE_TYPE),
    [],
  );

  return (
    <Stack
      width={width}
      height="100%"
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      paddingTop={1}
      gap={1}
      boxSizing="border-box"
    >
      <SelectField
        label={t("preview.shared.edit.image.modal.type.label")}
        id="imageType"
        options={imageTypeOptions}
        value={type}
        onChange={handleChangeType}
        disabled={isProcessing}
      />
      {type === IMAGE_TYPE.QUAD && (
        <FormControlLabel
          disabled={isProcessing}
          onClick={onChangeBorder}
          control={<Switch checked={isFixBorder} />}
          label={t("preview.shared.edit.image.modal.border.label")}
        />
      )}
      {isProcessing && (
        <Stack>
          <Typography>
            {t("preview.shared.edit.image.modal.progress.label")}
          </Typography>
          <LinearProgress
            color="inherit"
            variant={progress !== -1 ? "determinate" : "indeterminate"}
            value={progress !== -1 ? progress : undefined}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default memo(ImageParams);
