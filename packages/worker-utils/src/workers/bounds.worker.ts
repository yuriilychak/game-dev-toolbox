import { prepareImageWorker } from './utils';

const { canvas, context } = prepareImageWorker(self, 'image-editor');

self.onmessage = async function (
  event: MessageEvent<{
        data: imageEditor.LibraryImageData;
        offset: number;
        id: string;
    }>
) {
  const { data, offset, id } = event.data;

  await imageEditor.generateBounds(data, offset, canvas, context);

  // @ts-expect-error Typings issue
  self.postMessage({ data, id }, [data.src]);
};
