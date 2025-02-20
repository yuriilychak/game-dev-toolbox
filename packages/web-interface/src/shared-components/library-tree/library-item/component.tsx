import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEventHandler,
  MouseEventHandler
} from 'react';
import { NodeRendererProps } from 'react-arborist';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FilledInput from '@mui/material/FilledInput';
import Checkbox from '@mui/material/Checkbox';

import { EXPAND_ICONS, ITEM_ACTIONS } from './constants';
import { LibraryFile } from '../../../types';
import { ActionButton } from '../../action-button';
import {
  LIBRARY_ACTION,
  LIBRARY_FILE_TYPE,
  SELECTION_STATE
} from '../../../enums';
import { LIBRARY_ITEM_ICONS } from '../../../constants';
import { ACTION_TO_LOCALE, LIBRARY_ACTION_ICONS } from '../constants';
import { checkSelection, getChildIds } from './helpers';

const LibraryItem: FC<NodeRendererProps<LibraryFile>> = ({
  node,
  tree,
  style,
  dragHandle
}) => {
  const {
    disableEdit = false,
    //@ts-expect-error - tree props are not typed
    hasCheckboxes,
    //@ts-expect-error - tree props are not typed
    checkedIds,
    //@ts-expect-error - tree props are not typed
    onCheck,
    //@ts-expect-error - tree props are not typed
    onOpenContextMenu
  } = tree.props;

  const selectionState: SELECTION_STATE = checkSelection(node.data, checkedIds);
  const isChecked = selectionState === SELECTION_STATE.SELECTED;
  const isIndeterminate = selectionState === SELECTION_STATE.SELECTED_PARTIALY;
  const isFolder = node.data.type === LIBRARY_FILE_TYPE.FOLDER;

  const { t } = useTranslation();
  const [newLabel, setNewLabel] = useState('');
  const Icon = useMemo(
    () => LIBRARY_ITEM_ICONS.get(node.data.type),
    [node.data.type]
  );
  const ExpandIcon = useMemo(
    () => EXPAND_ICONS.get(node.isOpen),
    [node.isOpen]
  );
  const currentActions = useMemo(
    () => ITEM_ACTIONS.get(node.isEditing),
    [node.isEditing]
  );

  const labelRef = useRef('');
  const isReset: boolean = !node.isFocused && node.isEditing;
  const isSubmitDisabled: boolean = node.isEditing && newLabel.length === 0;

  labelRef.current = newLabel;

  useEffect(() => {
    if (node.isEditing) {
      setNewLabel(node.data.label);
    }
  }, [node.isEditing]);

  useEffect(() => {
    if (isReset) {
      node.reset();
    }
  }, [isReset]);

  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (!node.isLeaf) {
      node.toggle();
    }
  }, [node.isLeaf]);

  const handleDoubleClick = useCallback(() => {
    if (disableEdit) {
      return;
    }

    node.focus();
    node.edit();
  }, [node.isLeaf, disableEdit]);

  const handleAction = useCallback((id: string, action: LIBRARY_ACTION) => {
    switch (action) {
      case LIBRARY_ACTION.CANCEL:
        node.reset();
        break;
      case LIBRARY_ACTION.SUBMIT:
        node.submit(labelRef.current);
        break;
      case LIBRARY_ACTION.DELETE:
        tree.delete(id);
        break;
      case LIBRARY_ACTION.RENAME:
        node.focus();
        node.edit();
        break;
      default:
        console.warn('Wrong library action', action, id);
    }
  }, []);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target }) => setNewLabel(target.value),
    []
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.code === 'Enter') {
        node.submit(labelRef.current);
      }
    },
    []
  );

  const handleCheckClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.stopPropagation();
      event.preventDefault();

      const updatedIds = isFolder
        ? getChildIds(node.data.children)
        : [node.data.id];

      onCheck(updatedIds, !isChecked);
    },
    [onCheck, node.data.id, isFolder, node.data.children, isChecked]
  );

  const handleOpenContextMenu: MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();
      onOpenContextMenu && onOpenContextMenu(event.target as HTMLElement);
    },
    [onOpenContextMenu]
  );

  return (
    <Stack
      key={node.data.id}
      alignItems="center"
      direction="row"
      ref={dragHandle}
      onContextMenu={handleOpenContextMenu}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={style}
      sx={{
        maxHeight: 24,
        cursor: 'pointer',
        backgroundColor: node.isFocused || node.isSelected ? '#555' : 'unset',
        '&:hover': { backgroundColor: '#666' }
      }}
    >
      <Stack
        direction="row"
        gap={0.5}
        alignItems="center"
        maxHeight={24}
        sx={{ userSelect: 'none' }}
      >
        {hasCheckboxes && (
          <Checkbox
            checked={isChecked}
            indeterminate={isIndeterminate}
            onClick={handleCheckClick}
          />
        )}
        {!node.isLeaf && (
          <ExpandIcon fontSize="small" sx={{ userSelect: 'none' }} />
        )}
        <Icon fontSize="small" sx={{ userSelect: 'none' }} />
      </Stack>
      {node.isEditing ? (
        <FilledInput
          autoFocus
          inputProps={{ maxLength: 32 }}
          sx={{
            height: 24,
            '& input': { padding: 0, paddingLeft: 0.5 }
          }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={newLabel}
          hiddenLabel
          id="node_label_input"
          size="small"
        />
      ) : (
        <Typography noWrap paddingLeft={0.5} sx={{ userSelect: 'none' }}>
          {node.data.label}
        </Typography>
      )}
      <Box flex={1} />
      {!disableEdit &&
        currentActions.map((action) => (
          <ActionButton
            key={`item_action_${action}`}
            title={t(ACTION_TO_LOCALE.get(action))}
            Icon={LIBRARY_ACTION_ICONS.get(action)}
            action={action}
            id={node.data.id}
            onClick={handleAction}
            disabled={action === LIBRARY_ACTION.SUBMIT && isSubmitDisabled}
          />
        ))}
    </Stack>
  );
};

export default LibraryItem;
