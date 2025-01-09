import { createContext } from "react";

import { LibraryContextData } from "../types";

const emptyCallback = () => {};

const LibraryContext = createContext<LibraryContextData>({
  tree: [],
  isProcessing: false,
  focusedId: "",
  onProcessing: emptyCallback,
  onTreeChange: emptyCallback,
  onSelectionChanged: emptyCallback,
  onFocusChanged: emptyCallback
});

export default LibraryContext;
