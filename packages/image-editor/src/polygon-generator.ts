import { Polygon } from "./geom";
import ImageData from "./image-data";

export default class PolygonGenerator {
  private imageData: ImageData;
  private polygon: Polygon;

  constructor(
    inputBitmap: ImageBitmap,
    context: OffscreenCanvasRenderingContext2D,
  ) {
    this.imageData = new ImageData(inputBitmap, context);
    this.polygon = new Polygon(this.imageData);
  }

  public generate(): Uint16Array {
    return this.polygon.export();
  }

  get imageDimensionData(): Uint32Array {
    return this.imageData.dimensionData;
  }

  get sourceImageData(): Uint8Array {
    return this.imageData.data;
  }
}
