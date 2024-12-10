import { prepareImageWorker } from "./utils";

declare module imageEditor {
  export type ImageFileData = {};
  export type LibraryImageData = {};
  export function cropImage(
    imageData: ImageFileData,
    context: OffscreenCanvasRenderingContext2D,
  ): LibraryImageData;
}

const { context } = prepareImageWorker(self, "image-editor");

self.onmessage = async function (
  event: MessageEvent<imageEditor.ImageFileData>,
) {
  const result: imageEditor.LibraryImageData = await imageEditor.cropImage(
    event.data,
    context,
  );
  // @ts-ignore
  self.postMessage(result, [result.src]);
};
