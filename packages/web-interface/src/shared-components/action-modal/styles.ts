import { SxProps } from "@mui/material";

const STYLES: Record<string, SxProps> = {
  ROOT: { display: "flex", alignItems: "center", justifyContent: "center" },
  MODAL: {
    padding: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflow: "hidden",
  },
  FOOTER: {
    gap: 1,
    flexDirection: "row",
    height: 48,
    alignItems: "center",
    justifyContent: "end",
  },
};

export default STYLES;
