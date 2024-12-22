import { useCallback, useContext, useMemo, useState } from "react";
import { PolygonPacker } from "polygon-packer";

import Button from "@mui/material/Button";

import { LIBRARY_FILE_TYPE, SHARED_ACTION } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { useModal } from "../../../../../hooks";
import {
  ActionModal,
  LibraryTree,
  SHARED_MODAL_ACTIONS,
} from "../../../../../shared-components";
import { PreviewContext } from "../../../../../contexts";
import { filterTree } from "./helpers";
import { NEST_CONFIG } from "./constants";

const TextureAtlasEdit: SingleFileComponent<
  LIBRARY_FILE_TYPE.TEXTURE_ATLAS
> = ({ file }) => {
  const [isProcesing, setProcessing] = useState<boolean>(false);
  const { tree } = useContext(PreviewContext);
  const { isOpen, handleClose, handleOpen } = useModal();
  const filteredTree = useMemo(() => filterTree(tree), [tree]);
  const packer = useMemo(() => new PolygonPacker(), []);
  const [checkedIds, setCheckedIds] = useState(file.data.images);

  const handleCheck = useCallback(
    (idsToUpdate: string[], isChecked: boolean) =>
      setCheckedIds((prevCheckedIds) =>
        isChecked
          ? prevCheckedIds.concat(idsToUpdate)
          : prevCheckedIds.filter((id) => !idsToUpdate.includes(id)),
      ),
    [],
  );

  const actions = useMemo(
    () =>
      SHARED_MODAL_ACTIONS.map((action) => ({
        ...action,
        disabled: action.action === SHARED_ACTION.SUBMIT || isProcesing,
      })),
    [isProcesing],
  );

  const handleGenerate = useCallback(() => {
    setProcessing(true);

    //packer.start(NEST_CONFIG, );
  }, [checkedIds, tree, packer]);

  return (
    <>
      <Button variant="contained" size="small" onClick={handleOpen}>
        Edit
      </Button>
      <ActionModal
        actions={actions}
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
        <Button onClick={handleGenerate}>Generate</Button>
      </ActionModal>
    </>
  );
};

export default TextureAtlasEdit;
