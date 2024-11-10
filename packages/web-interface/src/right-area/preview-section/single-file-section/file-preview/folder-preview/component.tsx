import { memo } from "react";

import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { SingleFileComponent } from "../../types";
import { getFolderStatistic } from "./helpers";
import { formatSize } from "../../../../../helpers";
import { StatisticsContainer } from "../statistics-container";

const FolderPreview: SingleFileComponent<LIBRARY_FILE_TYPE.FOLDER> = ({
  file,
}) => {
  const { size, childCount } = getFolderStatistic(file.children);
  const messages = [`File count: ${childCount}`, `Size: ${formatSize(size)}`];

  return <StatisticsContainer messages={messages} />;
};

export default memo(FolderPreview);
