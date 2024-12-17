import { FC, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import LinearProgress from "@mui/material/LinearProgress";

import { ADD_TYPES } from "../constants";
import {
  LIBRARY_ITEM_ICONS,
  LIBRARY_ITEM_TYPE_LOCALES,
} from "../../../constants";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { FieldOption, LibraryFile } from "../../../types";
import { DnDArea } from "./dnd-area";
import { useAddFileModal } from "./hooks";
import { ActionModal, SelectField } from "../../../shared-components";

type AddFileModalProps = {
  onSubmit(items: LibraryFile[]): void;
  onCancel(): void;
};

const AddFileModal: FC<AddFileModalProps> = ({ onCancel, onSubmit }) => {
  const { t } = useTranslation();
  const {
    buttonActions,
    type,
    files,
    isLoading,
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

  return (
    <ActionModal
      width={512}
      open
      title={t("library.addModal.title")}
      disabled={isLoading}
      actions={buttonActions}
      onAction={handleAction}
    >
      <Stack gap={2}>
        <FormControl fullWidth>
          <InputLabel id="fileTypeLabel" required>
            {t("library.addModal.type.label")}
          </InputLabel>
          <SelectField
            id="fileTypeSelect"
            disabled={isLoading}
            label={t("library.addModal.type.label")}
            required
            value={type}
            onChange={handleAddTypeChange}
            options={selectOptions}
          />
        </FormControl>
        {isLoading && (
          <>
            <Typography>{t("library.addModal.lader.label")}</Typography>
            <LinearProgress color="inherit" />
          </>
        )}
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
            disabled={isLoading}
            onToggleLoading={handleToggleLoading}
            onChange={handleChangeFiles}
            onRemove={handleRemoveFile}
            type={type}
            nodes={files}
          />
        )}
      </Stack>
    </ActionModal>
  );
};

export default memo(AddFileModal);
