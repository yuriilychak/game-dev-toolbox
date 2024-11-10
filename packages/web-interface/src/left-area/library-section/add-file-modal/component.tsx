import { FC, memo } from "react";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { ADD_TYPES } from "../constants";
import {
  LIBRARY_ITEM_ICONS,
  LIBRARY_ITEM_TYPE_LOCALES,
} from "../../../constants";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { LibraryFile } from "../../../types";
import { DnDArea } from "./dnd-area";
import { useAddFileModal } from "./hooks";

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
    handleSubmit,
    handleToggleLoading,
  } = useAddFileModal(onSubmit);

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
            <Select
              required
              size="small"
              labelId="fileTypeLabel"
              id="fileTypeSelect"
              value={type.toString()}
              label={t("library.addModal.type.label")}
              onChange={handleAddTypeChange}
              sx={{ "& [role='combobox']": { display: "flex", gap: 1 } }}
            >
              {ADD_TYPES.map((type) => {
                const Icon = LIBRARY_ITEM_ICONS.get(type);

                return (
                  <MenuItem
                    value={type}
                    key={type}
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <Icon />
                    <Typography>
                      {t(LIBRARY_ITEM_TYPE_LOCALES.get(type))}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
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
          <Stack direction="row" gap={1} justifyContent="end">
            <Button
              variant="contained"
              size="small"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              {t("library.action.submit")}
            </Button>
            <Button variant="outlined" size="small" onClick={onCancel}>
              {t("library.action.cancel")}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default memo(AddFileModal);
