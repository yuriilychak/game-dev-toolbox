import { formatImageData } from "image-editor";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { generateUUID } from "../../../helpers";
import { LibraryFile } from "../../../types";

type FileData = {
  buffer: ArrayBuffer;
  type: string;
  label: string;
  size: number;
  index: number;
};

export async function filesToLibraryItem(
  files: File[],
  type: LIBRARY_FILE_TYPE,
): Promise<LibraryFile[]> {
  const result: LibraryFile[] = [];
  const fileData: FileData[] = await Promise.all(
    files.map(async (file, index) => {
      const buffer: ArrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
      });

      return {
        type: file.type,
        size: file.size,
        label: file.name,
        index,
        buffer,
      };
    }),
  );

  const imageData = await formatImageData(fileData);

  for (const data of imageData) {
    result.push({ label: data.inputLabel, id: generateUUID(), type, data });
  }

  return result;
}

export function getSubmitDisabled(
  type: LIBRARY_FILE_TYPE,
  files: LibraryFile[],
): boolean {
  switch (type) {
    case LIBRARY_FILE_TYPE.IMAGE:
      return files.length === 0;
    case LIBRARY_FILE_TYPE.TEXTURE_ATLAS:
      return files[0].label.length === 0;
    default:
      return true;
  }
}
