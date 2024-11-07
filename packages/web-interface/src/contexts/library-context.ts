import { createContext } from "react";

import { LibraryContextData } from "../types";

const emptyCallback = () => {};

const LibraryContext = createContext<LibraryContextData>({
  tree: [],
  onTreeChange: emptyCallback,
  onSelectionChanged: emptyCallback,
  focusedId: "",
  onFocusChanged: emptyCallback,
});

export default LibraryContext;
