import { singleThread, WORKER_TYPE } from "worker-utils";

import { IMAGE_TYPE } from "./enums";
import type {
  ImageTransformWorkerInput,
  ImageTransformWorkerResult,
  LibraryImageData,
} from "./types";

export default class ImageTransform {
  private imageData: LibraryImageData = null;

  private id: string = "";

  public init(id: string, imageData: LibraryImageData): void {
    this.id = id;
    this.imageData = { ...imageData };
  }

  public getChanged(imageData: LibraryImageData): boolean {
    return (
      this.imageData.type !== imageData.type ||
      this.imageData.isFixBorder !== imageData.isFixBorder
    );
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
    const data: LibraryImageData = {
      ...this.imageData,
      type,
      polygons: [],
      triangles: [],
      isFixBorder: false,
    };
    const result = await singleThread<
      ImageTransformWorkerInput,
      ImageTransformWorkerResult
    >(WORKER_TYPE.GENERATE_IMAGE_BOUNDS, { data, offset, id: this.id });

    this.imageData = result.data;
  }

  public get data(): LibraryImageData {
    return this.imageData;
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
