import { FC, useCallback, memo } from "react";
import {
  DeleteHandler,
  MoveHandler,
  NodeApi,
  RenameHandler,
  Tree,
} from "react-arborist";

import type { BoolFunc } from "react-arborist/dist/module/types/utils";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import { LibraryItem } from "./library-item";
import { LibraryFile } from "../../types";
import { LIBRAY_STYLES } from "./constants";

type LibraryTreeProps = {
  disabled?: boolean;
  tree: LibraryFile[];
  onCheck?: (value: boolean, id: string) => void;
  onRename?: RenameHandler<LibraryFile>;
  onMove?: MoveHandler<LibraryFile>;
  onDelete?: DeleteHandler<LibraryFile>;
  onFocus?: (id: string) => void;
  onSelect?(files: LibraryFile[]): void;
  hasCheckboxes?: boolean;
  checkedIds?: string[];
  disableEdit?: string | boolean | BoolFunc<LibraryFile>;
  disableDrag?: string | boolean | BoolFunc<LibraryFile>;
  disableDrop?: string | boolean | BoolFunc<LibraryFile>;
};

const LibraryTree: FC<LibraryTreeProps> = ({
  disabled = false,
  tree,
  disableEdit,
  hasCheckboxes = false,
  checkedIds = [],
  onCheck,
  onRename,
  onMove,
  onDelete,
  onFocus,
  onSelect,
}) => {
  const handleFocus = useCallback(
    (node: NodeApi<LibraryFile>) =>
      onFocus && onFocus(node.isLeaf ? node.parent.id : node.id),
    [onFocus],
  );

  const handleSelect = useCallback(
    (nodes: NodeApi<LibraryFile>[]) =>
      onSelect && onSelect(nodes.map(({ data }) => data)),
    [onSelect],
  );

  return (
    <Paper elevation={0} sx={{ width: "100%", height: 500 }}>
      <Box width="100%" height="100%" sx={LIBRAY_STYLES.get(disabled)}>
        <Tree
          data={tree}
          //@ts-ignore
          hasCheckboxes={hasCheckboxes}
          //@ts-ignore
          checkedIds={checkedIds}
          //@ts-ignore
          onCheck={onCheck}
          disableEdit={disableEdit}
          onFocus={handleFocus}
          onRename={onRename}
          onSelect={handleSelect}
          onMove={onMove}
          onDelete={onDelete}
          openByDefault={false}
          width="100%"
          height={500}
          indent={12}
          rowHeight={24}
          overscanCount={1}
        >
          {LibraryItem}
        </Tree>
      </Box>
    </Paper>
  );
};

export default memo(LibraryTree);
