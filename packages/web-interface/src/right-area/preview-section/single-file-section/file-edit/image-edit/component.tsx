import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { ImageContent } from "./modal-content";
import { useModal } from "../../../../../hooks";

const ImageEdit: SingleFileComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ file }) => {
  const { t } = useTranslation();
  const { isOpen, handleClose, handleOpen } = useModal();

  return (
    <>
      <Stack justifyContent="center" alignItems="center" padding={1}>
        <Button variant="contained" onClick={handleOpen} size="small">
          {t("preview.singleFile.edit.image.button.edit")}
        </Button>
      </Stack>
      {isOpen && <ImageContent file={file} onClose={handleClose} />}
    </>
  );
};

export default ImageEdit;
