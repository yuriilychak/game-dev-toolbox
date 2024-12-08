import ImageData from "../image-data";
import marchSquare from "./marching-squares";
import Polygon from "./polygon";
import Point from "./point";
import { IMAGE_TYPE } from "../enums";
import type { ImageWorkerData } from "../types";
import { cropImageBitmap, getQuadPolygon } from "../utils";
import { QUAD_TRIANGLES } from "../constants";

const canvas: OffscreenCanvas = new OffscreenCanvas(2048, 2048);
const context: OffscreenCanvasRenderingContext2D = canvas.getContext("2d", {
  willReadFrequently: true,
});

self.onmessage = async function ({
  data,
}: MessageEvent<{
  src: ImageBitmap;
  type: IMAGE_TYPE;
  extension: string;
  offset: number;
}>) {
  const result: ImageWorkerData = {
    src: null,
    polygons: [],
    triangles: [],
    isFixBorder: false,
  };

  if (data.type === IMAGE_TYPE.POLYGON) {
    const imageData = new ImageData(data.src, context);
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
      data.src,
      imageData.leftOffset - bounds.left,
      imageData.topOffset - bounds.top,
    );

    result.src = await createImageBitmap(canvas, 0, 0, width, height);

    polygons.reduce<ImageWorkerData>((res, polygon) => {
      const [polygonData, trianglesData] = polygon.export(
        bounds.left,
        bounds.top,
      );

      res.polygons.push(polygonData);
      res.triangles.push(trianglesData);

      return res;
    }, result);
  } else {
    if (data.offset === 0) {
      result.src = await cropImageBitmap(data.src, data.extension, context);
    } else {
      const newWidth: number = data.src.width + (data.offset << 1);
      const newHeight: number = data.src.height + (data.offset << 1);

      context.clearRect(0, 0, newWidth, newHeight);
      context.drawImage(data.src, data.offset, data.offset);

      result.src = await createImageBitmap(canvas, 0, 0, newWidth, newHeight);
    }

    result.polygons.push(getQuadPolygon(result.src));
    result.triangles.push(QUAD_TRIANGLES.slice());
    result.isFixBorder = data.offset === 1;
  }

  // @ts-ignore
  self.postMessage(result, [result.src]);
};
