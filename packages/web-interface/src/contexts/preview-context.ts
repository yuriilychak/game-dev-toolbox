import { createContext } from "react";

import { PreviewContextData } from "../types";

const PreviewContext = createContext<PreviewContextData>({
  tree: [],
  selectedFiles: [],
  onProcessing: () => {},
  onFilesChanged: () => {},
});

export default PreviewContext;
