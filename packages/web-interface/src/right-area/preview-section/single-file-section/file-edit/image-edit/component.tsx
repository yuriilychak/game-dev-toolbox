import { useState, useCallback, useRef, useLayoutEffect } from "react";

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";

const ImageEdit: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // Set the src to the SVG data URL
        img.src = "assets/checkerPattern.svg";

        img.onload = () => {
          // Create a pattern from the SVG image
          const pattern = ctx.createPattern(img, "repeat");

          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas
          }
        };
      }, 100);
    }
  }, [isModalOpen]);

  const onOpenModal = useCallback(() => setModalOpen(true), []);

  const onCloseModal = useCallback(() => setModalOpen(false), []);

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
              <Stack width={256} height="100%">
                Props
              </Stack>
            </Stack>
            <Stack gap={1} justifyContent="end" direction="row">
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
