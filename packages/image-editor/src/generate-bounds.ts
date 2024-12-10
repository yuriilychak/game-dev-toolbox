import { QUAD_TRIANGLES } from "./constants";
import { IMAGE_TYPE } from "./enums";
import { LibraryImageData } from "./types";
import { cropImageBitmap, getQuadPolygon } from "./utils";
import ImageData from "./image-data";
import { marchSquare, Point, Polygon } from "./geom";

export default async function generateBounds(
  data: LibraryImageData,
  offset: number,
  canvas: OffscreenCanvas,
  context: OffscreenCanvasRenderingContext2D,
): Promise<void> {
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

    data.src = await createImageBitmap(canvas, 0, 0, width, height);

    polygons.reduce<LibraryImageData>((result, polygon) => {
      const [polygonData, trianglesData] = polygon.export(
        bounds.left,
        bounds.top,
      );

      result.polygons.push(polygonData);
      result.triangles.push(trianglesData);

      return result;
    }, data);
  } else {
    if (offset === 0) {
      data.src = await cropImageBitmap(data.src, data.extension, context);
    } else {
      const newWidth: number = data.src.width + (offset << 1);
      const newHeight: number = data.src.height + (offset << 1);

      context.clearRect(0, 0, newWidth, newHeight);
      context.drawImage(data.src, offset, offset);

      data.src = await createImageBitmap(canvas, 0, 0, newWidth, newHeight);
    }

    data.polygons.push(getQuadPolygon(data.src));
    data.triangles.push(QUAD_TRIANGLES.slice());
  }

  data.isFixBorder = offset === 1;
}
