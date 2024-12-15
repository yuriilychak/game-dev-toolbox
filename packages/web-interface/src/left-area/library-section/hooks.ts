import { useCallback, useContext, useState } from "react";
import {
  DeleteHandler,
  MoveHandler,
  NodeApi,
  RenameHandler,
} from "react-arborist";

import { LibraryContext } from "../../contexts";
import { LIBRARY_ACTION } from "../../enums";
import {
  createNode,
  deleteItems,
  insertItems,
  moveItems,
  renameItem,
} from "./helpers";
import { LibraryFile } from "../../types";

export function useLibraryView() {
  const {
    tree,
    onTreeChange,
    focusedId,
    onFocusChanged,
    onSelectionChanged,
    isProcessing,
  } = useContext(LibraryContext);
  const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);

  const handleAction = useCallback(
    (focusedId: string, action: LIBRARY_ACTION) => {
      switch (action) {
        case LIBRARY_ACTION.ADD_FILE:
          setAddModalOpen(true);
          break;
        case LIBRARY_ACTION.ADD_FOLDER:
          onTreeChange(
            (prevTree) => insertItems(prevTree, [createNode()], focusedId).tree,
          );
          break;
      }
    },
    [onTreeChange],
  );

  const handleRename: RenameHandler<LibraryFile> = useCallback(
    ({ id, name }) =>
      onTreeChange((prevTree) => renameItem(prevTree, id, name).tree),
    [onTreeChange],
  );

  const handleMove: MoveHandler<LibraryFile> = useCallback(
    ({ dragIds, parentId }) =>
      onTreeChange((prevTree) => moveItems(prevTree, dragIds, parentId)),
    [onTreeChange],
  );

  const handleDelete: DeleteHandler<LibraryFile> = useCallback(
    ({ ids }) => onTreeChange((prevTree) => deleteItems(prevTree, ids).tree),
    [onTreeChange],
  );

  const handleFocus = useCallback(
    (node: NodeApi<LibraryFile>) =>
      onFocusChanged(node.isLeaf ? node.parent.id : node.id),
    [onFocusChanged],
  );

  const handleSelect = useCallback(
    (nodes: NodeApi<LibraryFile>[]) =>
      onSelectionChanged(nodes.map(({ data }) => data)),
    [onSelectionChanged],
  );

  const handleCloseAddModal = useCallback(() => setAddModalOpen(false), []);

  const handleAddFiles = (items: LibraryFile[]) => {
    onTreeChange((prevTree) => insertItems(prevTree, items, focusedId).tree);
    setAddModalOpen(false);
  };

  return {
    tree,
    isProcessing,
    isAddModalOpen,
    focusedId,
    handleAction,
    handleDelete,
    handleFocus,
    handleMove,
    handleRename,
    handleSelect,
    handleCloseAddModal,
    handleAddFiles,
  };
}
