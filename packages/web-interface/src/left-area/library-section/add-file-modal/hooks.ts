import {
  ChangeEventHandler,
  useCallback,
  useState,
  useRef,
  useMemo
} from "react";

import {
  ButtonGroupAction,
  SHARED_MODAL_ACTIONS
} from "../../../shared-components";
import { LIBRARY_FILE_TYPE, SHARED_ACTION } from "../../../enums";
import { LibraryFile } from "../../../types";
import { getSubmitDisabled } from "./helpers";
import { createTextureAtlas } from "../helpers";

export function useAddFileModal(
  onSubmit: (items: LibraryFile[]) => void,
  onCancel: () => void
) {
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [type, setType] = useState<LIBRARY_FILE_TYPE>(LIBRARY_FILE_TYPE.IMAGE);
  const [isLoading, setLoading] = useState<boolean>(false);
  const filesRef = useRef(files);
  const isSubmitDisabled: boolean = isLoading || getSubmitDisabled(type, files);

  filesRef.current = files;

  const buttonActions: ButtonGroupAction<SHARED_ACTION>[] = useMemo(
    () =>
      SHARED_MODAL_ACTIONS.map((action) =>
        action.action === SHARED_ACTION.SUBMIT
          ? { ...action, disabled: isSubmitDisabled }
          : action
      ),
    [isSubmitDisabled]
  );

  const handleChangeFiles = useCallback(
    (nodes: LibraryFile[]) =>
      setFiles((prevLibFiles) => prevLibFiles.concat(nodes)),
    [type]
  );

  const handleRemoveFile = useCallback(
    (id: string) =>
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id)),
    []
  );

  const handleAddTypeChange = useCallback((rawValue: string) => {
    const nextType = parseInt(rawValue) as LIBRARY_FILE_TYPE;
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
    []
  );

  const handleSubmit = () => onSubmit(files);

  const handleToggleLoading = useCallback(
    () => setLoading((isLoading) => !isLoading),
    []
  );

  const handleAction = useCallback(
    (action: SHARED_ACTION) => {
      switch (action) {
        case SHARED_ACTION.SUBMIT:
          onSubmit(filesRef.current);
          break;
        case SHARED_ACTION.CANCEL:
          onCancel();
          break;
        default:
      }
    },
    [onSubmit, onCancel]
  );

  return {
    buttonActions,
    files,
    type,
    isLoading,
    handleChangeFiles,
    handleAddTypeChange,
    handleNameChange,
    handleRemoveFile,
    handleSubmit,
    handleToggleLoading,
    handleAction
  };
}
