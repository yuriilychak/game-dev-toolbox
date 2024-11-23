import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { ImageContent } from "./modal-content";

const ImageEdit: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ file }) => {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => setModalOpen(true), []);

  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <Stack justifyContent="center" alignItems="center" padding={1}>
        <Button variant="contained" onClick={handleOpenModal} size="small">
          {t("preview.singleFile.edit.image.button.edit")}
        </Button>
      </Stack>
      <Modal
        open={isModalOpen}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <ImageContent file={file} onClose={handleCloseModal} />
      </Modal>
    </>
  );
};

export default ImageEdit;
