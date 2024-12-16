import { FC, useCallback, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { filesToLibraryItem } from "../helpers";
import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { LibraryFile } from "../../../../types";
import { LIBRARY_ITEM_ICONS } from "../../../../constants";
import { FileItem } from "./file-item";

type DnDAreaProps = {
  type: LIBRARY_FILE_TYPE;
  disabled?: boolean;
  onChange(nodes: LibraryFile[]): void;
  onRemove(id: string): void;
  nodes: LibraryFile[];
  onToggleLoading(): void;
};

const DnDArea: FC<DnDAreaProps> = ({
  type,
  nodes,
  disabled = false,
  onChange,
  onRemove,
  onToggleLoading,
}) => {
  const { t } = useTranslation();
  const AppIcon = useMemo(() => LIBRARY_ITEM_ICONS.get(type), [type]);

  const onDropAccepted = useCallback(
    async (files: File[]) => {
      onToggleLoading();

      const resultFiles = await filesToLibraryItem(files, type);

      onChange(resultFiles);

      onToggleLoading();
    },
    [type],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    accept: { "image/png": [".png"], "image/jpeg": [".jpeg"] },
    disabled: type !== LIBRARY_FILE_TYPE.IMAGE,
  });

  const dragLocale: string = isDragActive
    ? "library.addModal.fileSection.drop"
    : "library.addModal.fileSection.drag";

  return (
    <Stack
      gap={1}
      sx={disabled ? { pointerEvents: "none", opacity: 0.7 } : undefined}
    >
      <Stack
        {...getRootProps()}
        sx={{ cursor: "pointer" }}
        padding={2}
        gap={1}
        height={128}
        borderRadius={2}
        boxSizing="border-box"
        border="2px dashed white"
        alignItems="center"
        justifyContent="center"
      >
        <input {...getInputProps()} />
        <Typography sx={{ pointerEvents: "none" }}>{t(dragLocale)}</Typography>
      </Stack>
      {!!nodes.length && (
        <Stack gap={1}>
          <Typography>
            {t("library.addModal.fileSection.uploadTitle")}
          </Typography>
          <Stack gap={1} maxHeight={256} sx={{ overflowY: "auto" }}>
            {nodes.map((file) => (
              <FileItem
                key={file.id}
                AppIcon={AppIcon}
                file={file}
                onRemove={onRemove}
              />
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default memo(DnDArea);
