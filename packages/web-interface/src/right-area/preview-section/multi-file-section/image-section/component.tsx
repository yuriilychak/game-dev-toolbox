import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { FilesComponent } from "../../types";
import { ImageParams } from "../../shared";
import useImageSection from "./hooks";

const ImageSection: FilesComponent<LIBRARY_FILE_TYPE.IMAGE> = ({ files }) => {
  const {
    type,
    progress,
    isFixBorder,
    isProcessing,
    handleChangeType,
    handleToggleBorder,
  } = useImageSection(files);

  return (
    <ImageParams
      width="100%"
      progress={progress}
      paddingLeft={1}
      paddingRight={1}
      isProcessing={isProcessing}
      isFixBorder={isFixBorder}
      type={type}
      onChangeBorder={handleToggleBorder}
      onChangeType={handleChangeType}
    />
  );
};

export default ImageSection;
