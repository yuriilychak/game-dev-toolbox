export function prepareWorker(context: Window, packageName: string): void {
  // @ts-expect-error document mock
  context.document = {
    createElement: () => ({}) as HTMLElement
  };

  // @ts-expect-error Will be used in worker
  importScripts(
    context.location.href.replace(
      /^(.*\/)[^/]+\.js$/,
      `$1${packageName}.js`
    )
  );
}

export function prepareImageWorker(
  workerContext: Window,
  packageName: string,
  size: number = 2048
): {
    canvas: OffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
} {
  prepareWorker(workerContext, packageName);

  const canvas: OffscreenCanvas = new OffscreenCanvas(size, size);
  const context: OffscreenCanvasRenderingContext2D = canvas.getContext('2d', {
    willReadFrequently: true
  });

  return { canvas, context };
}
