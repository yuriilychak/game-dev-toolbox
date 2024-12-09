import { Point } from "./geom";
import BoundRect from "./geom/bound-rect";
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
    this._width = imageBitmap.width + (padding << 1);
    this._leftOffset = padding;
    this._rightOffset = this._width - padding - imageBitmap.width;
    this._height = imageBitmap.height + (padding << 1);
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

  public clearShape(contour: Point[]): void {
    const boundRect: BoundRect = BoundRect.fromPoints(contour);

    this.floodFill(contour[0].x, contour[0].y, boundRect);
  }

  private floodFill(x: number, y: number, boundRect: BoundRect): void {
    const visited = new Set<number>();
    const stack: Point[] = [new Point(x, y)];
    const offsets: Point[] = [
      new Point(1, 0),
      new Point(-1, 0),
      new Point(0, 1),
      new Point(0, -1),
    ];
    const neighboarCount: number = offsets.length;
    const nextPoint: Point = new Point();
    let currPoint: Point = null;
    let i: number = 0;

    while (stack.length > 0) {
      currPoint = stack.pop();
      visited.add(ImageData.getPointKey(currPoint));

      this.clearPixel(currPoint);

      for (i = 0; i < neighboarCount; ++i) {
        nextPoint.set(currPoint).add(offsets[i]);

        if (
          !visited.has(ImageData.getPointKey(nextPoint)) &&
          boundRect.contains(nextPoint) &&
          this.getFilled(nextPoint)
        ) {
          stack.push(nextPoint.clone());
        }
      }
    }
  }

  private clearPixel(point: Point): void {
    if (!this.contains(point)) {
      return;
    }

    const index = (point.y * this._width + point.x) * ImageData.BITS_PER_PIXEL;
    let i: number = 0;

    for (i = 0; i < 4; ++i) {
      this._data[index + i] = 0;
    }
  }

  public getFilled(point: Point): number {
    const alpha = intSign(this.getPixelAlpha(point.x, point.y));

    return (3 * alpha * alpha + alpha - 2) >> 1;
  }

  public getInContour(x: number, y: number): boolean {
    return this.getPixelAlpha(x, y) > 0 && !this.getBorder(x, y);
  }

  public getIndexFromPos(x: number, y: number): number {
    return y * this._width + x;
  }

  public contains(point: Point): boolean {
    return (
      point.x >= 0 &&
      point.x <= this.width - 1 &&
      point.y >= 0 &&
      point.y <= this.height - 1
    );
  }

  public inBounds(x: number, y: number): boolean {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
  }

  public getFirstNoneTransparentPixel(threshold: number): Point {
    const height: number = this.height;
    const width: number = this.width;
    let i: number = 0;
    let j: number = 0;

    for (i = 0; i < height; ++i) {
      for (j = 0; j < width; ++j) {
        if (this.getPixelAlpha(j, i) > threshold) {
          return new Point(j, i);
        }
      }
    }

    return new Point();
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

  public get isEmpty(): boolean {
    const totalPixels = this.totalPixels;
    let i: number = 0;

    for (i = 0; i < totalPixels; ++i) {
      if (this._data[i * ImageData.BITS_PER_PIXEL + 3] !== 0) {
        return false;
      }
    }

    return true;
  }

  private static getPointKey(point: Point): number {
    return (point.x << 16) | point.y;
  }

  private static readonly BITS_PER_PIXEL: number = 4;

  private static readonly CLASTER_SIZE: number = 4;
}
