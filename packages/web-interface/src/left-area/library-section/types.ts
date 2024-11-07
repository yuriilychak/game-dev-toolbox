import { LibraryFile } from "../../types";

export interface BasicExecutionResult {
  tree: LibraryFile[];
  isExecuted: boolean;
}

export interface DeleteExecutionResult extends BasicExecutionResult {
  ids: string[];
  removedItems: LibraryFile[];
}
