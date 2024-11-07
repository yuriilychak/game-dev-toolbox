import { useEffect, useMemo, FC, useState } from "react";
import { useTranslation } from "react-i18next";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import { TopArea } from "./top-area";
import { LeftArea } from "./left-area";
import { LibraryContext, PreviewContext } from "./contexts";
import { LibraryFile, LibraryContextData, PreviewContextData } from "./types";
import { GLOBAL_STYLES, ROOT_ID } from "./constants";
import { RightArea } from "./right-area";

const App: FC = () => {
  const theme = useMemo(
    () =>
      createTheme({
        typography: { fontFamily: "Arial" },
        palette: { mode: "dark" },
      }),
    [],
  );
  const { t } = useTranslation();
  const [libararyTree, setLibraryTree] = useState<LibraryFile[]>([]);
  const [libraryFocusedId, setLibraryFocusedId] = useState<string>(ROOT_ID);
  const [selectedFiles, setLibrarySelectedFiles] = useState<LibraryFile[]>([]);
  const libraryData = useMemo<LibraryContextData>(
    () => ({
      tree: libararyTree,
      focusedId: libraryFocusedId,
      onTreeChange: setLibraryTree,
      onFocusChanged: setLibraryFocusedId,
      onSelectionChanged: setLibrarySelectedFiles,
    }),
    [libararyTree, libraryFocusedId],
  );
  const previewData = useMemo<PreviewContextData>(
    () => ({ selectedFiles }),
    [selectedFiles],
  );

  useEffect(() => {
    const metaElement = document.getElementById("metaDescription");
    document.title = t("root.title");

    metaElement.setAttribute("content", t("root.description"));
  }, [t]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={GLOBAL_STYLES} />
      <Stack direction="column" flex={1} height="100%">
        <TopArea />
        <Stack direction="row" flex={1} height="100%">
          <LibraryContext.Provider value={libraryData}>
            <LeftArea />
          </LibraryContext.Provider>
          <Stack direction="column" flex={1} height="100%">
            <Box flex={1}>Working araea</Box>
            <Paper elevation={3}>Bottom intertface</Paper>
          </Stack>
          <PreviewContext.Provider value={previewData}>
            <RightArea />
          </PreviewContext.Provider>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
};

export default App;
