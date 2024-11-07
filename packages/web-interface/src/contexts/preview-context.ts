import { createContext } from "react";

import { PreviewContextData } from "../types";

const PreviewContext = createContext<PreviewContextData>({
  selectedFiles: [],
});

export default PreviewContext;
