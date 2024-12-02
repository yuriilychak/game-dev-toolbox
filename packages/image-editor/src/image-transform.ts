import { QUAD_TRIANGLES } from "./constants";
import { IMAGE_TYPE } from "./enums";
import { marchSquare, Point, Polygon } from "./geom";
import ImageData from "./image-data";
import { LibraryImageData } from "./types";
import { cropImageBitmap, getQuadPolygon } from "./utils";

export default class ImageTransform {
  private offscreenCanvas: OffscreenCanvas;

  private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

  private imageData: LibraryImageData;

  constructor() {
    this.imageData = null;
    this.offscreenCanvas = new OffscreenCanvas(2048, 2048);
    this.offscreenCanvasContext = this.offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  public init(imageData: LibraryImageData): void {
    this.imageData = { ...imageData };
  }

  public async updateType(type: IMAGE_TYPE): Promise<void> {
    this.imageData.type = type;

    switch (type) {
      case IMAGE_TYPE.QUAD:
        return await this.generateQuad();
      case IMAGE_TYPE.POLYGON:
        return await this.generatePolygon();
    }
  }

  private async generateQuad(): Promise<void> {
    this.imageData.type = IMAGE_TYPE.QUAD;
    this.imageData.isFixBorder = false;
    this.imageData.src = await cropImageBitmap(
      this.imageData.src,
      this.imageData.extension,
      this.offscreenCanvasContext,
    );
    this.imageData.polygons = [getQuadPolygon(this.imageData.src)];
    this.imageData.triangles = [QUAD_TRIANGLES.slice()];
  }

  private async generatePolygon(): Promise<void> {
    this.imageData.type = IMAGE_TYPE.POLYGON;

    if (this.imageData.isFixBorder) {
      await this.fixQuadBorder(false);
    }

    const imageData = new ImageData(
      this.imageData.src,
      this.offscreenCanvasContext,
    );
    const polygons: Polygon[] = [];
    let contour: Point[] = null;
    let polygon: Polygon = null;
    let index: number = 0;
    let i: number = 0;

    while (!imageData.isEmpty) {
      console.log("NEW POLYGON");
      contour = marchSquare(imageData, 0);
      polygon = new Polygon(contour);

      if (!polygon.isBroken) {
        polygons.push(polygon);
      }

      imageData.clearContour(polygon.polygon);
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

    const polygonData = polygons.reduce(
      (result, polygon) => {
        const [polygonData, trianglesData] = polygon.export(
          bounds.left,
          bounds.top,
        );

        result.polygons.push(polygonData);
        result.triangles.push(trianglesData);

        return result;
      },
      { polygons: [], triangles: [] },
    );

    this.imageData.polygons = polygonData.polygons;
    this.imageData.triangles = polygonData.triangles;

    this.offscreenCanvasContext.clearRect(0, 0, bounds.width, bounds.height);
    this.offscreenCanvasContext.drawImage(
      this.imageData.src,
      imageData.leftOffset - bounds.left,
      imageData.topOffset - bounds.top,
    );

    this.imageData.src = await createImageBitmap(
      this.offscreenCanvas,
      0,
      0,
      bounds.width,
      bounds.height,
    );
  }

  public async fixQuadBorder(isFixBorder: boolean): Promise<void> {
    const offset: number = isFixBorder ? 1 : -1;
    const newWidth: number = this.imageData.src.width + (offset << 1);
    const newHeight: number = this.imageData.src.height + (offset << 1);

    this.offscreenCanvasContext.clearRect(0, 0, newWidth, newHeight);
    this.offscreenCanvasContext.drawImage(this.imageData.src, offset, offset);

    this.imageData.isFixBorder = isFixBorder;
    this.imageData.src = await createImageBitmap(
      this.offscreenCanvas,
      0,
      0,
      newWidth,
      newHeight,
    );
    this.imageData.polygons = [getQuadPolygon(this.imageData.src)];
  }

  public polgonAt(index: number): Uint16Array {
    return this.imageData.polygons[index];
  }

  public trianglesAt(index: number): Uint16Array {
    return this.imageData.triangles[index];
  }

  public get width(): number {
    return this.imageData.src.width;
  }

  public get height(): number {
    return this.imageData.src.height;
  }

  public get imageBitmap(): ImageBitmap {
    return this.imageData.src;
  }

  public get polygonCount(): number {
    return this.imageData.polygons.length;
  }

  public get trianglesCount(): number {
    return this.imageData.triangles.length;
  }
}
