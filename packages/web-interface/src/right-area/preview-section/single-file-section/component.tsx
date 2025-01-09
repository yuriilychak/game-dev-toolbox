import { memo } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LIBRARY_ITEM_ICONS } from '../../../constants';
import { FilePreview } from './file-preview';
import { FileEdit } from './file-edit';
import type { FilesComponent } from '../types';

const SingleFileSection: FilesComponent = ({ files }) => {
  const file = files[0];
  const Icon = LIBRARY_ITEM_ICONS.get(file.type);

  return (
    <Stack gap={0.5}>
      <Stack direction="row" gap={0.5}>
        <Icon fontSize="small" />
        <Typography noWrap>{file.label}</Typography>
      </Stack>
      <FilePreview file={file} />
      <FileEdit file={file} />
    </Stack>
  );
};

export default memo(SingleFileSection);
