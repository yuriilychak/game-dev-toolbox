import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEventHandler,
} from "react";
import { NodeRendererProps } from "react-arborist";
import { useTranslation } from "react-i18next";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FilledInput from "@mui/material/FilledInput";

import { EXPAND_ICONS, ITEM_ACTIONS } from "./constants";
import { LibraryFile } from "../../../types";
import { ActionButton } from "../../action-button";
import { LIBRARY_ACTION } from "../../../enums";
import { LIBRARY_ITEM_ICONS } from "../../../constants";
import { ACTION_TO_LOCALE, LIBRARY_ACTION_ICONS } from "../constants";

const LibraryItem: FC<NodeRendererProps<LibraryFile>> = ({
  node,
  tree,
  style,
  dragHandle,
}) => {
  const { disableEdit = false } = tree.props;
  const { t } = useTranslation();
  const [newLabel, setNewLabel] = useState("");
  const Icon = useMemo(
    () => LIBRARY_ITEM_ICONS.get(node.data.type),
    [node.data.type],
  );
  const ExpandIcon = useMemo(
    () => EXPAND_ICONS.get(node.isOpen),
    [node.isOpen],
  );
  const currentActions = useMemo(
    () => ITEM_ACTIONS.get(node.isEditing),
    [node.isEditing],
  );
  const labelRef = useRef("");
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

  const handleClick = useCallback(() => {
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
        console.warn("Wrong library action", action, id);
    }
  }, []);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    ({ target }) => setNewLabel(target.value),
    [],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.code === "Enter") {
        node.submit(labelRef.current);
      }
    },
    [],
  );

  return (
    <Stack
      key={node.data.id}
      alignItems="center"
      direction="row"
      ref={dragHandle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={style}
      sx={{
        cursor: "pointer",
        backgroundColor: node.isFocused || node.isSelected ? "#555" : "unset",
        "&:hover": { backgroundColor: "#666" },
      }}
    >
      <Stack direction="row" gap={0.5} alignItems="center">
        {!node.isLeaf && <ExpandIcon fontSize="small" />}
        <Icon fontSize="small" />
      </Stack>
      {node.isEditing ? (
        <FilledInput
          autoFocus
          inputProps={{ maxLength: 32 }}
          sx={{ height: 24, "& input": { padding: 0, paddingLeft: 0.5 } }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={newLabel}
          hiddenLabel
          id="node_label_input"
          size="small"
        />
      ) : (
        <Typography noWrap paddingLeft={0.5}>
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
