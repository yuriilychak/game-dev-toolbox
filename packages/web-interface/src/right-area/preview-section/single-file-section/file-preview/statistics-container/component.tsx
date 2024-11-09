import { FC, ReactNode } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

type StatisticsContainerProps = { children?: ReactNode; messages: string[] };

const StatisticsContainer: FC<StatisticsContainerProps> = ({
  children,
  messages,
}) => (
  <Paper elevation={0}>
    {children}
    <Stack
      height={48}
      direction="row"
      columnGap={1}
      flexWrap="wrap"
      padding={0.5}
      boxSizing="border-box"
      alignItems="center"
      justifyContent="center"
    >
      {messages.map((message, index) => (
        <Typography key={`message${index}`} fontSize="small">
          {message}
        </Typography>
      ))}
    </Stack>
  </Paper>
);

export default StatisticsContainer;
