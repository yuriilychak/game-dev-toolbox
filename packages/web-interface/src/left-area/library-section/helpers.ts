import { LIBRARY_FILE_TYPE } from "../../enums";
import { LibraryFile } from "../../types";
import { ROOT_ID } from "../../constants";
import { generateUUID } from "../../helpers";
import { BasicExecutionResult, DeleteExecutionResult } from "./types";

const hasChildren = (node: LibraryFile): boolean =>
  !!node.children && node.children.length !== 0;

const getLabelExists = (label: string, nodes: LibraryFile[]): boolean =>
  nodes.some((node) => node.label === label);

const findItemsAtLevel = (
  id: string,
  items: LibraryFile[],
  parentItems: LibraryFile[] | null = null,
): LibraryFile[] | null =>
  items.reduce<LibraryFile[] | null>((result, node) => {
    switch (true) {
      case result !== null:
        return result;
      case node.id === id && node.type === LIBRARY_FILE_TYPE.FOLDER:
        return node.children;
      case node.id === id:
        return parentItems;
      case id === ROOT_ID:
        return items;
      case hasChildren(node):
        return findItemsAtLevel(id, node.children, items);
      default:
        return result;
    }
  }, null);

function sortLayer(a: LibraryFile, b: LibraryFile): number {
  if (
    a.type === LIBRARY_FILE_TYPE.FOLDER &&
    b.type !== LIBRARY_FILE_TYPE.FOLDER
  ) {
    return -1;
  }

  return a.type !== LIBRARY_FILE_TYPE.FOLDER &&
    b.type === LIBRARY_FILE_TYPE.FOLDER
    ? 1
    : a.label.localeCompare(b.label);
}

const updateLabel = (
  node: LibraryFile,
  nodes: LibraryFile[],
  label: string = node.label,
): LibraryFile => ({ ...node, label: getUniqueLabel(label, nodes) });

const updateChildren = (
  node: LibraryFile,
  children: LibraryFile[],
  isSort: boolean = true,
): LibraryFile => ({
  ...node,
  children: isSort ? children.sort(sortLayer) : children,
});

const getExecutionResult = (
  tree: LibraryFile[] = [],
): BasicExecutionResult => ({
  tree,
  isExecuted: tree.length !== 0,
});

export function deleteItems(
  tree: LibraryFile[],
  ids: string[],
): DeleteExecutionResult {
  const result: DeleteExecutionResult = {
    tree: [],
    isExecuted: false,
    ids: ids.slice(),
    removedItems: [],
  };

  if (ids.length === 0) {
    result.tree = tree;
    return result;
  }

  tree.reduce<DeleteExecutionResult>((result, node) => {
    const idIndex: number = result.ids.indexOf(node.id);

    if (idIndex !== -1) {
      result.isExecuted = true;
      result.ids.splice(idIndex, 1);
      result.removedItems.push(node);
    } else if (result.ids.length !== 0 && hasChildren(node)) {
      const childrenData = deleteItems(node.children, result.ids);

      if (childrenData.isExecuted) {
        result.isExecuted = true;
        result.ids = childrenData.ids;
        result.removedItems = result.removedItems.concat(
          childrenData.removedItems,
        );
        result.tree.push(updateChildren(node, childrenData.tree, false));
      } else {
        result.tree.push(node);
      }
    } else {
      result.tree.push(node);
    }

    return result;
  }, result);

  if (!result.isExecuted) {
    result.tree = tree;
  }

  return result;
}

export function getUniqueLabel(
  label: string,
  tree: LibraryFile[],
  parentId: string | null = null,
): string {
  // Отримуємо масив елементів на вказаному рівні дерева або у батьківському рівні
  const nodes: LibraryFile[] | null =
    parentId === null ? tree : findItemsAtLevel(parentId, tree);

  if (nodes === null) {
    throw new Error(
      "Parent ID not found in the tree or no valid items at this level.",
    );
  }

  const maxLabelLength: number = 32;
  let result: string = label;
  let suffixIndex: number = 1;
  let suffix: string = "";
  let allowedLength: number = 0;
  let truncatedLabel: string = "";

  while (getLabelExists(result, nodes)) {
    suffix = `(${++suffixIndex})`;
    allowedLength = maxLabelLength - suffix.length;
    truncatedLabel = label.slice(0, allowedLength);
    result = truncatedLabel + suffix;
  }

  return result;
}

const insertItemsWithRename = (
  nodesToInsert: LibraryFile[],
  prevNodes: LibraryFile[],
): LibraryFile[] =>
  nodesToInsert
    .reduce((result, node) => {
      let resultNode: LibraryFile = getLabelExists(node.label, result)
        ? updateLabel(node, result)
        : node;

      result.push(resultNode);

      return result;
    }, prevNodes.slice())
    .sort(sortLayer);

export function insertItems(
  inputTree: LibraryFile[],
  nodesToInsert: LibraryFile[],
  id: string | null,
): BasicExecutionResult {
  if (id === null || id === ROOT_ID) {
    return getExecutionResult(insertItemsWithRename(nodesToInsert, inputTree));
  }

  return inputTree.reduce<BasicExecutionResult>((result, node) => {
    let updatedNode: LibraryFile = null;

    if (!result.isExecuted) {
      if (node.id === id) {
        const children = insertItemsWithRename(nodesToInsert, node.children);

        updatedNode = updateChildren(node, children);
      } else if (hasChildren(node)) {
        const nodeData = insertItems(node.children, nodesToInsert, id);

        if (nodeData.isExecuted) {
          updatedNode = updateChildren(node, nodeData.tree);
        }
      }
    }

    result.isExecuted = result.isExecuted || updatedNode !== null;
    result.tree.push(updatedNode || node);

    return result;
  }, getExecutionResult());
}

export function moveItems(
  inputTree: LibraryFile[],
  ids: string[],
  parentId: string | null,
): LibraryFile[] {
  const { tree, removedItems } = deleteItems(inputTree, ids);

  return insertItems(tree, removedItems, parentId).tree;
}

export const renameItem = (
  inputTree: LibraryFile[],
  id: string,
  label: string,
): BasicExecutionResult =>
  inputTree.reduce<BasicExecutionResult>((result, node) => {
    let updatedNode: LibraryFile = null;

    if (!result.isExecuted) {
      if (node.id === id) {
        updatedNode = updateLabel(node, inputTree, label);
      } else if (hasChildren(node)) {
        const nodeData = renameItem(node.children, id, label);

        if (nodeData.isExecuted) {
          updatedNode = updateChildren(node, nodeData.tree);
        }
      }
    }

    result.isExecuted = result.isExecuted || updatedNode !== null;

    result.tree.push(updatedNode || node);

    return result;
  }, getExecutionResult());

export const createNode = (): LibraryFile<LIBRARY_FILE_TYPE.FOLDER> => ({
  id: generateUUID(),
  type: LIBRARY_FILE_TYPE.FOLDER,
  children: [],
  label: "New Folder",
  data: null,
});

export const createTextureAtlas =
  (): LibraryFile<LIBRARY_FILE_TYPE.TEXTURE_ATLAS> => ({
    label: "Texture atlas",
    id: generateUUID(),
    type: LIBRARY_FILE_TYPE.TEXTURE_ATLAS,
    data: {
      size: 0,
      images: [] as string[],
      placement: [] as object[],
      isGenerated: false,
      resolution: { width: 4096, height: 4096 },
    },
  });
