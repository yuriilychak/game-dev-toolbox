import { memo } from "react";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { TypedPreviewComponent } from "../types";
import { StatisticsContainer } from "../statistics-container";

const TextureAtlasPreview: TypedPreviewComponent<
  LIBRARY_FILE_TYPE.TEXTURE_ATLAS
> = ({ file }) => (
  <StatisticsContainer
    messages={[
      `ImageCount: ${file.data.images.length}`,
      `Generated: ${file.data.isGenerated}`,
      `Width: ${file.data.resolution.width}px`,
      `Height: ${file.data.resolution.height}px`,
    ]}
  />
);

export default memo(TextureAtlasPreview);
