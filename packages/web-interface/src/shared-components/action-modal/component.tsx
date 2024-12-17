import { ReactNode, memo } from "react";

import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography/Typography";

import { ButtonGroup } from "../button-group";
import STYLES from "./styles";
import { SHARED_ACTION } from "../../enums";

import type { ButtonGroupAction } from "../button-group";

type ActionModalProps<T extends number> = {
  open: boolean;
  width: number | string;
  height?: number | string;
  dividerIndex?: number;
  title: string;
  children: ReactNode;
  fotterContent?: ReactNode;
  disabled?: boolean;
  actions?: ButtonGroupAction<T>[];
  onAction(action: T): void;
};

function ActionModal<T extends number = SHARED_ACTION>({
  open,
  title,
  children,
  width,
  height,
  disabled = false,
  dividerIndex = 0,
  actions,
  onAction,
  fotterContent = null,
}: ActionModalProps<T>) {
  return (
    <Modal open={open} sx={STYLES.ROOT}>
      <Paper sx={{ ...STYLES.MODAL, width, height }}>
        <Typography variant="h5">{title}</Typography>
        {children}
        <Stack sx={STYLES.FOOTER}>
          {fotterContent}
          <ButtonGroup
            width="100%"
            disabled={disabled}
            actions={actions}
            dividerIndex={dividerIndex}
            onClick={onAction}
          />
        </Stack>
      </Paper>
    </Modal>
  );
}

export default memo(ActionModal);
