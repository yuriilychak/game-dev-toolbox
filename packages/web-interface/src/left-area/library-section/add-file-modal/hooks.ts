import { ChangeEventHandler, useCallback, useState } from "react";

import { SelectChangeEvent } from "@mui/material/Select";

import { LIBRARY_FILE_TYPE } from "../../../enums";
import { LibraryFile } from "../../../types";
import { getSubmitDisabled } from "./helpers";
import { createTextureAtlas } from "../helpers";

export function useAddFileModal(onSubmit: (items: LibraryFile[]) => void) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [type, setType] = useState<LIBRARY_FILE_TYPE>(LIBRARY_FILE_TYPE.NONE);
  const [isLoading, setLoading] = useState<boolean>(false);

  const isSubmitDisabled: boolean = isLoading || getSubmitDisabled(type, files);

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
        ? [createTextureAtlas()]
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

  const handleToggleLoading = useCallback(
    () => setLoading((isLoading) => !isLoading),
    [],
  );

  return {
    isLoading,
    isSubmitDisabled,
    files,
    type,
    handleChangeFiles,
    handleAddTypeChange,
    handleNameChange,
    handleRemoveFile,
    handleSubmit,
    handleToggleLoading,
  };
}
