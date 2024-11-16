import { FC, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import { ADD_TYPES } from "../constants";
import {
  LIBRARY_ITEM_ICONS,
  LIBRARY_ITEM_TYPE_LOCALES,
} from "../../../constants";
import { LIBRARY_ACTION, LIBRARY_FILE_TYPE } from "../../../enums";
import { FieldOption, LibraryFile } from "../../../types";
import { DnDArea } from "./dnd-area";
import { useAddFileModal } from "./hooks";
import {
  ButtonGroup,
  ButtonGroupAction,
  SelectField,
} from "../../../shared-components";
import { FOOTER_ACTIONS } from "./constants";

type AddFileModalProps = {
  onSubmit(items: LibraryFile[]): void;
  onCancel(): void;
};

const AddFileModal: FC<AddFileModalProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const {
    type,
    files,
    isLoading,
    isSubmitDisabled,
    handleAddTypeChange,
    handleChangeFiles,
    handleNameChange,
    handleRemoveFile,
    handleAction,
    handleToggleLoading,
  } = useAddFileModal(onSubmit, onCancel);

  const selectOptions = useMemo<FieldOption[]>(
    () =>
      ADD_TYPES.map((value) => ({
        value,
        label: t(LIBRARY_ITEM_TYPE_LOCALES.get(value)),
        Icon: LIBRARY_ITEM_ICONS.get(value),
      })),
    [t],
  );

  const buttonActions: ButtonGroupAction<LIBRARY_ACTION>[] = useMemo(
    () =>
      FOOTER_ACTIONS.map((action) =>
        action.action === LIBRARY_ACTION.SUBMIT
          ? { ...action, disabled: isSubmitDisabled }
          : action,
      ),
    [isSubmitDisabled],
  );

  return (
    <Paper sx={{ width: 512 }}>
      <Stack gap={2} padding={2}>
        <Typography variant="h5">{t("library.addModal.title")}</Typography>
        <Stack
          gap={2}
          sx={isLoading ? { pointerEvents: "none", opacity: 0.7 } : undefined}
        >
          <FormControl fullWidth>
            <InputLabel id="fileTypeLabel" required>
              {t("library.addModal.type.label")}
            </InputLabel>
            <SelectField
              id="fileTypeSelect"
              label={t("library.addModal.type.label")}
              required
              value={type}
              onChange={handleAddTypeChange}
              options={selectOptions}
            />
          </FormControl>
          {type === LIBRARY_FILE_TYPE.TEXTURE_ATLAS && (
            <TextField
              size="small"
              required
              id="file-name"
              label={t("library.addModal.name.label")}
              value={files[0].label}
              onChange={handleNameChange}
              slotProps={{ htmlInput: { maxLength: 32 } }}
            />
          )}
          {type === LIBRARY_FILE_TYPE.IMAGE && (
            <DnDArea
              onToggleLoading={handleToggleLoading}
              onChange={handleChangeFiles}
              onRemove={handleRemoveFile}
              type={type}
              nodes={files}
            />
          )}
          <ButtonGroup
            width="100%"
            actions={buttonActions}
            dividerIndex={0}
            onClick={handleAction}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default memo(AddFileModal);
