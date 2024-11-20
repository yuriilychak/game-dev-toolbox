import { IMAGE_TYPE } from "./enums";
import { ImageFileData } from "./types";

const canvas: OffscreenCanvas = new OffscreenCanvas(2048, 2048);
const context: OffscreenCanvasRenderingContext2D = canvas.getContext("2d", {
  willReadFrequently: true,
});

function getIndex(x: number, y: number, width: number) {
  return ((y * width + x) << 2) + 3;
}

self.onmessage = async function (e: MessageEvent<ImageFileData>) {
  const { buffer, type, size, label } = e.data;
  const blob = new Blob([buffer], { type });
  let imageBitmap: ImageBitmap = await createImageBitmap(blob);

  if (type !== "image/jpeg") {
    const size: Uint16Array = new Uint16Array([
      imageBitmap.width,
      imageBitmap.height,
    ]);
    context.clearRect(0, 0, size[0], size[0]);
    context.drawImage(imageBitmap, 0, 0);

    const { data }: ImageData = context.getImageData(0, 0, size[0], size[1]);
    const last: Uint16Array = new Uint16Array([size[0] - 1, size[1] - 1]);
    const min: Int16Array = new Int16Array([-1, -1]);
    const max: Int16Array = new Int16Array([-1, -1]);
    const indices: Uint32Array = new Uint32Array([0, 0]);
    let y: number = 0;
    let x: number = 0;

    for (y = 0; y < size[1]; ++y) {
      if (min[1] !== -1 && max[1] !== -1) {
        break;
      }

      for (x = 0; x < size[0]; ++x) {
        indices[0] = getIndex(x, y, size[0]);
        indices[1] = getIndex(x, last[1] - y, size[0]);

        if (data[indices[0]] > 0 && min[1] === -1) {
          min[1] = y;
        }

        if (data[indices[1]] > 0 && max[1] === -1) {
          max[1] = last[1] - y;
        }

        if (min[1] !== -1 && max[1] !== -1) {
          break;
        }
      }
    }

    for (x = 0; x < size[0]; ++x) {
      if (min[0] !== -1 && max[0] !== -1) {
        break;
      }

      for (y = 0; y < size[1]; ++y) {
        indices[0] = getIndex(x, y, size[0]);
        indices[1] = getIndex(last[0] - x, y, size[0]);

        if (data[indices[0]] > 0 && min[0] === -1) {
          min[0] = x;
        }

        if (data[indices[1]] > 0 && max[0] === -1) {
          max[0] = last[0] - x;
        }

        if (min[0] !== -1 && max[0] !== -1) {
          break;
        }
      }
    }

    if (
      !(
        min[0] == -1 ||
        (min[0] === 0 &&
          min[1] === 0 &&
          max[0] === last[0] &&
          max[1] === last[1])
      )
    ) {
      size[0] = max[0] - min[0] + 1;
      size[1] = max[1] - min[1] + 1;
      const widthOffset: number = size[0] << 2;
      const croppedData = new Uint8ClampedArray(widthOffset * size[1]);
      let sourceStart: number = 0;
      let targetStart: number = 0;

      for (y = 0; y < size[1]; ++y) {
        sourceStart = ((min[1] + y) * imageBitmap.width + min[0]) << 2;
        targetStart = y * widthOffset;
        croppedData.set(
          data.subarray(sourceStart, sourceStart + widthOffset),
          targetStart,
        );
      }

      const croppedImageData = new ImageData(croppedData, size[0], size[1]);

      imageBitmap = await createImageBitmap(croppedImageData);
    }
  }

  const labelSplit = label.split(".");
  const extension = labelSplit.pop().toUpperCase();
  const inputLabel = labelSplit.join(".").substring(0, 32);
  const polygonArray: Uint16Array = new Uint16Array([
    0,
    0,
    imageBitmap.width,
    0,
    imageBitmap.width,
    imageBitmap.height,
    0,
    imageBitmap.height,
  ]);
  const polygon: ArrayBuffer = polygonArray.buffer;
  const triangleArray: Uint8Array = new Uint8Array([0, 1, 2, 0, 2, 3]);
  const triangles: ArrayBuffer = triangleArray.buffer;

  self.postMessage(
    {
      src: imageBitmap,
      width: imageBitmap.width,
      height: imageBitmap.height,
      extension,
      inputLabel,
      size,
      type: IMAGE_TYPE.QUAD,
      polygon,
      triangles,
      triangleCount: 2,
    },
    // @ts-ignore
    [imageBitmap, polygon, triangles],
  );
};
