import { Polygon } from "./geom";
import ImageData from "./image-data";

export default class PolygonGenerator {
  private rawImage: Uint8Array;
  private imageData: ImageData;
  private polygon: Polygon;

  constructor(inputBitmap: ImageBitmap) {
    const canvas: OffscreenCanvas = new OffscreenCanvas(
      inputBitmap.width,
      inputBitmap.height,
    );
    const context: OffscreenCanvasRenderingContext2D = canvas.getContext(
      "2d",
    ) as OffscreenCanvasRenderingContext2D;

    context.drawImage(inputBitmap, 0, 0);

    const imageData = context.getImageData(
      0,
      0,
      inputBitmap.width,
      inputBitmap.height,
    );

    this.rawImage = new Uint8Array(imageData.data.buffer);
    this.imageData = new ImageData(
      this.rawImage,
      inputBitmap.width,
      inputBitmap.height,
      PolygonGenerator.CLASTER_SIZE,
    );
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

  private static CLASTER_SIZE: number = 4;
}
