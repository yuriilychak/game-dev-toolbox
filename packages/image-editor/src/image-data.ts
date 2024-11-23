import { intAbs, intSign } from "./math";

export default class ImageData {
  private _data: Uint8Array;
  private _width: number;
  private _height: number;
  private _leftOffset: number;
  private _rightOffset: number;
  private _topOffset: number;
  private _bottomOffset: number;

  constructor(
    imageBitmap: ImageBitmap,
    context: OffscreenCanvasRenderingContext2D,
  ) {
    const padding = ImageData.CLASTER_SIZE * 16;
    this._width =
      Math.ceil(imageBitmap.width / ImageData.CLASTER_SIZE) *
        ImageData.CLASTER_SIZE +
      2 * padding;
    this._leftOffset = padding;
    this._rightOffset = this._width - padding - imageBitmap.width;
    this._height =
      Math.ceil(imageBitmap.height / ImageData.CLASTER_SIZE) *
        ImageData.CLASTER_SIZE +
      2 * padding;
    this._topOffset = padding;
    this._bottomOffset = this._height - padding - imageBitmap.height;

    context.clearRect(0, 0, this._width, this._height);
    context.drawImage(imageBitmap, this._leftOffset, this._rightOffset);

    const imageData = context.getImageData(0, 0, this._width, this._height);

    this._data = new Uint8Array(imageData.data.buffer);
  }

  public getPixelAlpha(x: number, y: number): number {
    return (this._data as Uint8Array)[((this._width * y + x) << 2) + 3];
  }

  public getBorder(x: number, y: number): boolean {
    if (this.getPixelAlpha(x, y) === 0) {
      return false;
    }

    const lastX: number = this._width - 1;
    const lastY: number = this._height - 1;

    if (
      !((intAbs((y << 1) - lastY) - lastY) * (intAbs((x << 1) - lastX) - lastX))
    ) {
      return true;
    }

    let i: number = 0;
    let neighboarOffset: number = 0;
    let currentOffset: number = 0;

    for (i = 0; i < 4; ++i) {
      neighboarOffset = ((i & 1) << 1) - 1;
      currentOffset = neighboarOffset * (i >> 1);

      if (
        !this.getPixelAlpha(
          x + neighboarOffset - currentOffset,
          y + currentOffset,
        )
      ) {
        return true;
      }
    }

    return false;
  }

  public getFilled(x: number, y: number): number {
    const alpha = intSign(this.getPixelAlpha(x, y));

    return (3 * alpha * alpha + alpha - 2) >> 1;
  }

  public getInContour(x: number, y: number): boolean {
    return this.getPixelAlpha(x, y) > 0 && !this.getBorder(x, y);
  }

  public getIndexFromPos(x: number, y: number): number {
    return y * this._width + x;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get topOffset(): number {
    return this._topOffset;
  }

  public get bottomOffset(): number {
    return this._bottomOffset;
  }

  public get leftOffset(): number {
    return this._leftOffset;
  }

  public get rightOffset(): number {
    return this._rightOffset;
  }

  public get data(): Uint8Array {
    return this._data;
  }

  public get totalPixels(): number {
    return this._width * this._height;
  }

  private static CLASTER_SIZE: number = 4;
}
