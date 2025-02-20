import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import {
  ActionButton,
  LibraryTree,
  LIBRARY_ACTION_ICONS,
  ACTION_TO_LOCALE
} from '../../shared-components';
import { ROOT_ACTIONS } from './constants';
import { useLibraryView } from './hooks';
import { AddFileModal } from './add-file-modal';

const LibrarySection: FC = () => {
  const { t } = useTranslation();
  const {
    isMenuOpen,
    anchorEl,
    tree,
    isProcessing,
    isAddModalOpen,
    focusedId,
    handleAction,
    handleDelete,
    handleFocus,
    handleMove,
    handleRename,
    handleAddModalClose,
    handleAddFiles,
    handleSelect,
    handleOpenContextMenu,
    handleCloseContextMenu
  } = useLibraryView();

  return (
    <Stack gap={0.5} padding={0.5}>
      <Stack direction="row">
        <Typography noWrap>{t('library.title')}</Typography>
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
      <LibraryTree
        disabled={isProcessing}
        tree={tree}
        onFocus={handleFocus}
        onRename={handleRename}
        onSelect={handleSelect}
        onMove={handleMove}
        onDelete={handleDelete}
        onOpenContextMenu={handleOpenContextMenu}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseContextMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem onClick={handleCloseContextMenu}>Profile</MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>My account</MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>Logout</MenuItem>
      </Menu>
      {isAddModalOpen && (
        <AddFileModal
          onCancel={handleAddModalClose}
          onSubmit={handleAddFiles}
        />
      )}
    </Stack>
  );
};

export default memo(LibrarySection);
