import { MouseEventHandler, useCallback, memo } from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { ButtonGroupAction } from "./types";
import { useTranslation } from "react-i18next";

type ButtonGroupProps<T extends number> = {
  onClick(action: T): void;
  actions: ButtonGroupAction<T>[];
  dividerIndex?: number;
  flex?: number;
  width?: string | number;
  disabled?: boolean;
};

function ButtonGroup<T extends number>({
  onClick,
  actions,
  dividerIndex = -1,
  flex,
  width,
  disabled = false,
}: ButtonGroupProps<T>) {
  const { t } = useTranslation();
  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => onClick(parseInt((event.target as HTMLButtonElement).id) as T),
    [onClick],
  );

  let totalActions = actions;

  if (dividerIndex !== -1) {
    totalActions = totalActions.slice();

    totalActions.splice(dividerIndex, 0, { locale: "", action: -1 as T });
  }

  return (
    <Stack direction="row" gap={1} flex={flex} width={width}>
      {totalActions.map(({ action, variant, locale, ...rest }) =>
        action === -1 ? (
          <Box flex={1} key="divider" />
        ) : (
          <Button
            id={action.toString()}
            key={`button_${action}`}
            variant={variant}
            size="small"
            disabled={rest.disabled || disabled}
            onClick={handleClick}
          >
            {t(locale)}
          </Button>
        ),
      )}
    </Stack>
  );
}

export default memo(ButtonGroup);
