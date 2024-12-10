import { prepareImageWorker } from "./utils";

declare module imageEditor {
  export type ImageFileData = {};
  export type LibraryImageData = {};
  export function generateBounds(
    data: LibraryImageData,
    offset: number,
    canvas: OffscreenCanvas,
    context: OffscreenCanvasRenderingContext2D,
  ): Promise<void>;
}

const { canvas, context } = prepareImageWorker(self, "image-editor");

self.onmessage = async function (
  event: MessageEvent<{
    data: imageEditor.LibraryImageData;
    offset: number;
    id: string;
  }>,
) {
  const { data, offset, id } = event.data;

  await imageEditor.generateBounds(data, offset, canvas, context);

  // @ts-ignore
  self.postMessage({ data, id }, [data.src]);
};
