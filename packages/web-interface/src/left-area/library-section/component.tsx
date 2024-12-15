import { FC, memo } from "react";
import { useTranslation } from "react-i18next";
import { Tree } from "react-arborist";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";

import { LibraryItem } from "./library-item";
import { ActionButton } from "../../shared-components";
import {
  ACTION_TO_LOCALE,
  LIBRARY_ACTION_ICONS,
  LIBRAY_STYLES,
  ROOT_ACTIONS,
} from "./constants";
import { useLibraryView } from "./hooks";
import { AddFileModal } from "./add-file-modal";

const LibrarySection: FC = () => {
  const { t } = useTranslation();
  const {
    tree,
    isProcessing,
    isAddModalOpen,
    focusedId,
    handleAction,
    handleDelete,
    handleFocus,
    handleMove,
    handleRename,
    handleCloseAddModal,
    handleAddFiles,
    handleSelect,
  } = useLibraryView();

  console.log(isProcessing, LIBRAY_STYLES.get(isProcessing));

  return (
    <Stack gap={0.5} padding={0.5}>
      <Stack direction="row">
        <Typography noWrap>{t("library.title")}</Typography>
        <Box flex={1} />
        {ROOT_ACTIONS.map((action) => (
          <ActionButton
            key={`library_action_${action}`}
            title={t(ACTION_TO_LOCALE.get(action))}
            action={action}
            id={focusedId}
            onClick={handleAction}
            Icon={LIBRARY_ACTION_ICONS.get(action)}
          />
        ))}
      </Stack>
      <Paper elevation={0} sx={LIBRAY_STYLES.get(isProcessing)}>
        <Tree
          data={tree}
          onFocus={handleFocus}
          onRename={handleRename}
          onSelect={handleSelect}
          onMove={handleMove}
          onDelete={handleDelete}
          openByDefault={false}
          width="100%"
          height={500}
          indent={12}
          rowHeight={24}
          overscanCount={1}
        >
          {LibraryItem}
        </Tree>
      </Paper>
      <Modal
        open={isAddModalOpen}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <AddFileModal
          onCancel={handleCloseAddModal}
          onSubmit={handleAddFiles}
        />
      </Modal>
    </Stack>
  );
};

export default memo(LibrarySection);
