import { prepareImageWorker } from './utils';

const { context } = prepareImageWorker(self, 'image-editor');

self.onmessage = async function (
  event: MessageEvent<imageEditor.ImageFileData>
) {
  const result: imageEditor.LibraryImageData = await imageEditor.cropImage(
    event.data,
    context
  );

  // @ts-expect-error Typings issue
  self.postMessage(result, [result.src]);
};
