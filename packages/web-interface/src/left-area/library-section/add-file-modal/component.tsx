import { FC, ChangeEventHandler, memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { ADD_TYPES } from "../constants";
import {
  LIBRARY_ITEM_ICONS,
  LIBRARY_ITEM_TYPE_LOCALES,
} from "../../../constants";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { LibraryFile } from "../../../types";
import { generateUUID } from "../../../helpers";
import { DnDArea } from "./dnd-area";
import { getSubmitDisabled } from "./helpers";

type AddFileModalProps = {
  onSubmit(items: LibraryFile[]): void;
  onCancel(): void;
};

const AddFileModal: FC<AddFileModalProps> = ({ onCancel, onSubmit }) => {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [type, setType] = useState<LIBRARY_FILE_TYPE>(LIBRARY_FILE_TYPE.NONE);
  const { t } = useTranslation();

  const isSubmitDisabled: boolean = getSubmitDisabled(type, files);

  const handleChangeFiles = useCallback(
    (nodes: LibraryFile[]) =>
      setFiles((prevLibFiles) => prevLibFiles.concat(nodes)),
    [type],
  );

  const handleRemoveFile = useCallback(
    (id: string) =>
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id)),
    [],
  );

  const handleAddTypeChange = useCallback((event: SelectChangeEvent) => {
    const nextType = parseInt(event.target.value) as LIBRARY_FILE_TYPE;
    const nextFiles: LibraryFile[] =
      nextType === LIBRARY_FILE_TYPE.TEXTURE_ATLAS
        ? [
            {
              label: "",
              id: generateUUID(),
              type: LIBRARY_FILE_TYPE.TEXTURE_ATLAS,
              data: { images: [] as string[], placement: [] as object[] },
            },
          ]
        : [];

    setType(nextType);
    setFiles(nextFiles);
  }, []);

  const handleNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target }) =>
      setFiles((prevFiles) => [{ ...prevFiles[0], label: target.value }]),
    [],
  );

  const handleSubmit = () => onSubmit(files);

  return (
    <Paper sx={{ width: 512 }}>
      <Stack gap={2} padding={2}>
        <Typography variant="h5">{t("library.addModal.title")}</Typography>
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
    </Paper>
  );
};

export default memo(AddFileModal);
