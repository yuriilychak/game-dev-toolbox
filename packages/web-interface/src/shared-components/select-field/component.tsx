import { FC, memo, useCallback } from "react";

import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { FieldOption } from "../../types";

type SelectFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: number | string;
  options: FieldOption[];
  onChange(value: string, id: string): void;
};

const SelectField: FC<SelectFieldProps> = ({
  id,
  label,
  value,
  options,
  required = false,
  onChange,
}) => {
  const handleChange = useCallback(
    (event: SelectChangeEvent) => onChange(event.target.value, id),
    [onChange, id],
  );

  return (
    <Select
      required={required}
      size="small"
      labelId={`${id}_label`}
      id={id}
      value={value}
      label={label}
      onChange={handleChange}
      sx={{ "& [role='combobox']": { display: "flex", gap: 1 } }}
    >
      {options.map(({ value, label, Icon, disabled }) => (
        <MenuItem
          disabled={disabled}
          value={value}
          key={`item_${value}`}
          sx={{ display: "flex", gap: 1 }}
        >
          {Icon && <Icon />}
          <Typography>{label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default memo(SelectField);
