import { FC, memo } from 'react';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const TopArea: FC = () => (
  <Paper
    elevation={3}
    sx={{ padding: 1, boxSizing: 'border-box', borderBottom: '1px solid #666' }}
  >
    <Box component="img" src="assets/logo.svg" height={12} width={128} />
  </Paper>
);

export default memo(TopArea);
