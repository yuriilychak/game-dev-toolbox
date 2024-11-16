import { intAbs, intSign } from "./math";
import { formatDimension, getCropData, joinCoords, splitCoords } from "./utils";

export default class ImageData {
  private _data: Uint8Array;
  private _width: number;
  private _height: number;
  private _leftOffset: number;
  private _rightOffset: number;
  private _topOffset: number;
  private _bottomOffset: number;
  private _cropX: number;
  private _cropY: number;
  private _cropWidth: number;
  private _cropHeight: number;

  constructor(
    imageData: Uint8Array,
    inputWidth: number,
    inputHeight: number,
    clasterSize: number,
  ) {
    const cropData = getCropData(imageData, inputWidth, inputHeight);
    const cropOffset = splitCoords(cropData[0]);
    const cropSize = splitCoords(cropData[1]);
    const horizontalData = formatDimension(cropSize[0], clasterSize);
    const verticalData = formatDimension(cropSize[1], clasterSize);
    const imageByteCount = (horizontalData[0] * verticalData[0]) << 2;

    this._width = horizontalData[0];
    this._leftOffset = horizontalData[1];
    this._rightOffset = horizontalData[2];
    this._height = verticalData[0];
    this._topOffset = verticalData[1];
    this._bottomOffset = verticalData[2];
    this._cropX = cropOffset[0];
    this._cropY = cropOffset[1];
    this._cropWidth = cropSize[0];
    this._cropHeight = cropSize[1];
    this._data = new Uint8Array(imageByteCount);

    this._generateImageData(imageData, inputWidth);
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

  private _generateImageData(imageData: Uint8Array, inputWidth: number): void {
    this._data.fill(0);

    let i: number = 0;
    let vertexIndex: number = 0;
    const cropOffset: number = this._cropWidth << 2;
    const rowSize: number = this._width << 2;
    const offset: number = (this._topOffset * rowSize + this._leftOffset) << 2;
    const vertexOffset: number = (inputWidth * this._cropY + this._cropX) << 2;

    for (i = 0; i < this._cropHeight; ++i) {
      vertexIndex = ((inputWidth * i) << 2) + vertexOffset;

      this._data.set(
        imageData.slice(vertexIndex, vertexIndex + cropOffset),
        i * rowSize + offset,
      );
    }
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

  public get dimensionData(): Uint32Array {
    const result = new Uint32Array(4);

    result[0] = joinCoords(this._width, this._height);
    result[1] = joinCoords(
      joinCoords(this._leftOffset, this._rightOffset, 8),
      joinCoords(this._topOffset, this._bottomOffset, 8),
    );
    result[2] = joinCoords(this._cropWidth, this._cropHeight);
    result[3] = joinCoords(this._cropX, this._cropY);

    return result;
  }
}
