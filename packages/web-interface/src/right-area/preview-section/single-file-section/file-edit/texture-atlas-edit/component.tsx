import { useCallback, useContext, useMemo, useState } from "react";

import Button from "@mui/material/Button";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { useModal } from "../../../../../hooks";
import {
  ActionModal,
  LibraryTree,
  SHARED_MODAL_ACTIONS,
} from "../../../../../shared-components";
import { PreviewContext } from "../../../../../contexts";
import { filterTree } from "./helpers";

const TextureAtlasEdit: SingleFileComponent<
  LIBRARY_FILE_TYPE.TEXTURE_ATLAS
> = ({ file }) => {
  const { tree } = useContext(PreviewContext);
  const { isOpen, handleClose, handleOpen } = useModal();
  const filteredTree = useMemo(() => filterTree(tree), [tree]);
  const [checkedIds, setCheckedIds] = useState(file.data.images);

  const handleCheck = useCallback(
    (value: boolean, idToUpdate: string) =>
      setCheckedIds((prevCheckedIds) =>
        value
          ? [...prevCheckedIds, idToUpdate]
          : prevCheckedIds.filter((id) => id !== idToUpdate),
      ),
    [],
  );

  return (
    <>
      <Button variant="contained" size="small" onClick={handleOpen}>
        Edit
      </Button>
      <ActionModal
        actions={SHARED_MODAL_ACTIONS}
        open={isOpen}
        width={500}
        title={"Edit atlas"}
        onAction={handleClose}
      >
        <LibraryTree
          tree={filteredTree}
          disableEdit
          hasCheckboxes
          onCheck={handleCheck}
          checkedIds={checkedIds}
        />
      </ActionModal>
    </>
  );
};

export default TextureAtlasEdit;
