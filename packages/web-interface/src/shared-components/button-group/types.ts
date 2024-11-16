export type ButtonGroupAction<T extends number> = {
  locale: string;
  action: T;
  disabled?: boolean;
  variant?: "text" | "outlined" | "contained";
};
