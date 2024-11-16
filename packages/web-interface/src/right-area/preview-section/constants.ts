export const PREVIEW_CHECKER: ImageBitmap = await (async () =>
  fetch("assets/checkerPattern32.png")
    .then((result) => result.blob())
    .then((blob) => createImageBitmap(blob)))();
