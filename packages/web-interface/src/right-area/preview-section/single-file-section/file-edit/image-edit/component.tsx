import {
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
  useMemo,
  useEffect,
} from "react";

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import BoundEditor from "./bound-editor";

const marks = [
  { value: 0.1, label: "10%" },
  { value: 1, label: "100%" },
  { value: 4, label: "400%" },
];

function valueText(value: number): string {
  return `${Math.round(value * 100)}%`;
}

const ImageEdit: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ file }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const boundEditor = useMemo(() => new BoundEditor(), []);

  const handleScaleChange = useCallback(
    (event: Event, value: number) => setScale(value),
    [],
  );

  useEffect(() => {
    boundEditor.scale = scale;
  }, [boundEditor, scale]);

  useLayoutEffect(() => {
    if (isModalOpen) {
      boundEditor.init(file, canvasRef);
    }

    return boundEditor.destroy.bind(boundEditor);
  }, [file, isModalOpen, boundEditor]);

  const onOpenModal = useCallback(() => setModalOpen(true), []);

  const onCloseModal = useCallback(() => setModalOpen(false), []);

  const onResetTransform = useCallback(() => {
    boundEditor.resetTransform();
    setScale(1);
  }, [boundEditor]);

  return (
    <>
      <Stack justifyContent="center" alignItems="center" padding={1}>
        <Button variant="contained" onClick={onOpenModal} size="small">
          Edit bounds
        </Button>
      </Stack>
      <Modal
        open={isModalOpen}
        onClose={onCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper
          elevation={2}
          sx={{
            width: "96vw",
            height: "96vh",
            padding: 2,
            boxSizing: "border-box",
          }}
        >
          <Stack height="100%" width="100%" gap={1}>
            <Typography variant="h5">Edit bounds</Typography>
            <Stack flex={1} direction="row">
              <Box flex={1} height="100%">
                <Box
                  component="canvas"
                  width="100%"
                  height="100%"
                  ref={canvasRef}
                />
              </Box>
              <Stack width={256} height="100%" paddingX={2}>
                Props
              </Stack>
            </Stack>
            <Stack gap={1} direction="row" height={48} alignItems="center">
              <Stack
                direction="row"
                gap={1}
                sx={{
                  paddingBottom: 1,
                  paddingRight: 2,
                  width: 256,
                  height: 48,
                  boxSizing: "border-box",
                }}
              >
                <Typography sx={{ paddingTop: 0.25 }}>Scale:</Typography>
                <Slider
                  size="small"
                  min={0.1}
                  max={4}
                  onChange={handleScaleChange}
                  value={scale}
                  getAriaValueText={valueText}
                  step={0.1}
                  valueLabelDisplay="auto"
                  marks={marks}
                />
              </Stack>
              <Button
                variant="contained"
                size="small"
                onClick={onResetTransform}
              >
                Reset transform
              </Button>
              <Box flex={1} />
              <Button variant="contained" size="small">
                Submit
              </Button>
              <Button variant="outlined" size="small" onClick={onCloseModal}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Modal>
    </>
  );
};

export default ImageEdit;
