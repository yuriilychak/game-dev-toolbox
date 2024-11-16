import { IMAGE_TYPE } from "image-editor";
import { LIBRARY_FILE_TYPE } from "../../../enums";
import { generateUUID } from "../../../helpers";
import { LibraryFile, LibraryImageData } from "../../../types";

export async function filesToLibraryItem(
  files: File[],
  type: LIBRARY_FILE_TYPE,
): Promise<LibraryFile[]> {
  const result: LibraryFile[] = [];
  const reader: FileReader = new FileReader();
  const img: HTMLImageElement = new Image();
  let label: string = "";
  let size: number = 0;
  let src: string = "";
  let extension: string = "";
  let resolution: { width: number; height: number; src: ImageBitmap } = null;
  let data: LibraryImageData = null;
  let labelSplit: string[] = null;

  for (const file of files) {
    size = file.size;
    labelSplit = file.name.split(".");
    extension = labelSplit.pop().toUpperCase();
    label = labelSplit.join(".").substring(0, 32);

    src = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

    resolution = await new Promise((resolve) => {
      img.onload = async () =>
        resolve({
          width: img.width,
          height: img.height,
          src: await createImageBitmap(img),
        });
      img.src = src;
    });

    data = {
      ...resolution,
      extension,
      size,
      type: IMAGE_TYPE.QUAD,
      polygon: [0, 0, img.width, 0, img.width, img.height, 0, img.height],
      triangles: [0, 1, 2, 0, 2, 3],
      triangleCount: 2,
    };

    result.push({ label, id: generateUUID(), type, data });
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
