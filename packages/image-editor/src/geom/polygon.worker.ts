import ImageData from "../image-data";
import marchSquare from "./marching-squares";
import Polygon from "./polygon";
import Point from "./point";

const canvas: OffscreenCanvas = new OffscreenCanvas(2048, 2048);
const context: OffscreenCanvasRenderingContext2D = canvas.getContext("2d", {
  willReadFrequently: true,
});

self.onmessage = async function (e: MessageEvent<ImageBitmap>) {
  const imageData = new ImageData(e.data, context);
  const polygons: Polygon[] = [];
  let contour: Point[] = null;
  let polygon: Polygon = null;
  let index: number = 0;
  let i: number = 0;

  while (!imageData.isEmpty) {
    contour = marchSquare(imageData, 0);
    polygon = new Polygon(contour);

    polygon.optimize();

    if (!polygon.isBroken) {
      polygons.push(polygon);
    }

    imageData.clearShape(contour);
  }

  while (index !== -1) {
    for (i = 0; i < polygons.length; ++i) {
      index = polygons[i].unite(polygons, i);

      if (index !== -1) {
        polygons.splice(index, 1);
        break;
      }
    }
  }

  const bounds = polygons.reduce(
    (result, polygon) => result.union(polygon.bounds, true),
    polygons[0].bounds.clone(),
  );
  const width: number = bounds.width;
  const height: number = bounds.height;

  context.clearRect(0, 0, width, height);
  context.drawImage(
    e.data,
    imageData.leftOffset - bounds.left,
    imageData.topOffset - bounds.top,
  );

  const src = await createImageBitmap(canvas, 0, 0, width, height);
  const result = polygons.reduce<{
    src: ImageBitmap;
    polygons: Uint16Array[];
    triangles: Uint16Array[];
  }>(
    (result, polygon) => {
      const [polygonData, trianglesData] = polygon.export(
        bounds.left,
        bounds.top,
      );

      result.polygons.push(polygonData);
      result.triangles.push(trianglesData);

      return result;
    },
    { polygons: [], triangles: [], src },
  );

  // @ts-ignore
  self.postMessage(result, [src]);
};
