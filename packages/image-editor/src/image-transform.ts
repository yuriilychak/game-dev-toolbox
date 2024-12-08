import { IMAGE_TYPE } from "./enums";
import type { ImageWorkerData, LibraryImageData } from "./types";

export default class ImageTransform {
  private imageData: LibraryImageData;

  constructor() {
    this.imageData = null;
  }

  public init(imageData: LibraryImageData): void {
    this.imageData = { ...imageData };
  }

  public async updateType(type: IMAGE_TYPE): Promise<void> {
    await this.transformImageData(type, 0);
  }

  public async fixQuadBorder(isFixBorder: boolean): Promise<void> {
    await this.transformImageData(IMAGE_TYPE.QUAD, isFixBorder ? 1 : -1);
  }

  private async transformImageData(
    type: IMAGE_TYPE,
    offset: number,
  ): Promise<void> {
    const { data } = await new Promise<MessageEvent<ImageWorkerData>>(
      (resolve, reject) => {
        const worker = new Worker(
          new URL("./geom/polygon.worker", import.meta.url),
          { type: "module" },
        );

        worker.onmessage = resolve;
        worker.onerror = reject;

        worker.postMessage(
          {
            src: this.imageData.src,
            type,
            extension: this.imageData.extension,
            offset,
          },
          [this.imageData.src],
        );
      },
    );

    this.imageData.src = data.src;
    this.imageData.type = type;
    this.imageData.isFixBorder = data.isFixBorder;
    this.imageData.polygons = data.polygons;
    this.imageData.triangles = data.triangles;
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
