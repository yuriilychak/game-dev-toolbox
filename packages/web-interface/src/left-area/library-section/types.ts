import { LibraryFile } from "../../types";

export type BasicExecutionResult = {
  tree: LibraryFile[];
  isExecuted: boolean;
}

export type DeleteExecutionResult = {
  ids: string[];
  removedItems: LibraryFile[];
} & BasicExecutionResult
