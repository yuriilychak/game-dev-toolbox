import { QUAD_TRIANGLES } from "./constants";
import { IMAGE_TYPE } from "./enums";
import { Polygon } from "./geom";
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
    const polygon = new Polygon(imageData);

    const polygonData = polygon.export();

    this.imageData.polygons = polygonData.polygons;
    this.imageData.triangles = polygonData.triangles;

    this.offscreenCanvasContext.clearRect(
      0,
      0,
      polygonData.resultBounds[2],
      polygonData.resultBounds[3],
    );
    this.offscreenCanvasContext.drawImage(
      this.imageData.src,
      polygonData.resultBounds[0],
      polygonData.resultBounds[1],
    );

    this.imageData.src = await createImageBitmap(
      this.offscreenCanvas,
      0,
      0,
      polygonData.resultBounds[2],
      polygonData.resultBounds[3],
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
