import {
  IMAGE_TYPE,
  ImageTransformWorkerInput,
  ImageTransformWorkerResult,
} from "image-editor";
import { LIBRARY_FILE_TYPE } from "../../../../enums";
import { LibraryFile } from "../../../../types";

export function getImageType(
  files: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[],
): IMAGE_TYPE {
  const fileCount: number = files.length;

  switch (fileCount) {
    case 0:
      return IMAGE_TYPE.NONE;
    case 1:
      return files[0].data.type;
    default: {
      const result: IMAGE_TYPE = files[0].data.type;
      let i: number = 0;

      for (i = 1; i < fileCount; ++i) {
        if (files[i].data.type !== result) {
          return IMAGE_TYPE.NONE;
        }
      }

      return result;
    }
  }
}

export function transformFiles(
  files: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[],
  type: IMAGE_TYPE,
  offset: number,
): ImageTransformWorkerInput[] {
  const fileCount: number = files.length;
  const result: ImageTransformWorkerInput[] = new Array(fileCount);
  let file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE> = null;
  let i: number = 0;

  for (i = 0; i < fileCount; ++i) {
    file = files[i];

    result[i] = {
      id: file.id,
      offset,
      data: {
        ...file.data,
        type,
        triangles: [],
        polygons: [],
        isFixBorder: false,
      },
    };
  }

  return result;
}

export function updateFiles(
  outputs: ImageTransformWorkerResult[],
  files: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[],
): LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[] {
  const outputSize: number = outputs.length;
  const fileCount: number = files.length;
  const result: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>[] = [];
  let output: ImageTransformWorkerResult = outputs[0];
  let file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE> = files[0];
  let i: number = 0;
  let j: number = 0;

  for (i = 0; i < outputSize; ++i) {
    output = outputs[i];

    file = null;

    for (j = 0; j < fileCount; ++j) {
      if (files[i].id === output.id) {
        file = files[i];
        break;
      }
    }

    if (file !== null) {
      result.push({ ...file, data: output.data });
    }
  }

  return result;
}
