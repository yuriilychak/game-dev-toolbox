import { useCallback, useState } from "react";

export default function useModal(initialOpen: boolean = false): {
  isOpen: boolean;
  handleOpen(): void;
  handleClose(): void;
} {
  const [isOpen, setOpen] = useState(initialOpen);

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => setOpen(false), []);

  return { isOpen, handleOpen, handleClose };
}
