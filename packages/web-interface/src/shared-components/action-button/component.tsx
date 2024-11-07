import { FC, MouseEventHandler, useCallback, memo } from "react";

import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";

type ActionButtonProps = {
  title: string;
  action: number;
  id: string;
  disabled?: boolean;
  onClick(id: string, action: number): void;
  Icon: typeof SvgIcon;
};

const ActionButton: FC<ActionButtonProps> = ({
  id,
  title,
  action,
  onClick,
  Icon,
  disabled = false,
}) => {
  const handleClick: MouseEventHandler = useCallback(
    (e) => {
      e.stopPropagation();

      onClick(id, action);
    },
    [id, action, onClick],
  );

  return (
    <Tooltip title={title}>
      <IconButton size="small" onClick={handleClick} disabled={disabled}>
        <Icon sx={{ fontSize: 14 }} />
      </IconButton>
    </Tooltip>
  );
};

export default memo(ActionButton);
