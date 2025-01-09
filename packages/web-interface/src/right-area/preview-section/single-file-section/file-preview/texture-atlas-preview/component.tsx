import { memo } from "react";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { StatisticsContainer } from "../statistics-container";

const TextureAtlasPreview: SingleFileComponent<
  LIBRARY_FILE_TYPE.TEXTURE_ATLAS
> = ({ file }) => (
  <StatisticsContainer
    messages={[
      `ImageCount: ${file.data.images.length}`,
      `Generated: ${file.data.isGenerated}`,
      `Width: ${file.data.width}px`,
      `Height: ${file.data.height}px`
    ]}
  />
);

export default memo(TextureAtlasPreview);
