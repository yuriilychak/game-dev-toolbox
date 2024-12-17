import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { useModal } from "../../../../../hooks";

const TextureAtlasEdit: SingleFileComponent<
  LIBRARY_FILE_TYPE.TEXTURE_ATLAS
> = ({ file }) => {
  const { isOpen, handleClose, handleOpen } = useModal();

  return (
    <>
      <Button variant="contained" size="small" onClick={handleOpen}>
        Edit
      </Button>
      <Modal
        open={isOpen}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div>Content</div>
      </Modal>
    </>
  );
};

export default TextureAtlasEdit;
