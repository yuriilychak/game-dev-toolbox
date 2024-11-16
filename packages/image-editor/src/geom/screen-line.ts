import { maxInt } from "../math";
import Point from "./point";
import { findIndex } from "./utils";

export default class ScreenLine {
  private _data: Int32Array = new Int32Array(3);

  constructor(begin: Point, end: Point, points: Array<Point> = []) {
    this.update(begin, end, points);
  }

  public update(begin: Point, end: Point, points: Array<Point>): void {
    this.set(begin.x, begin.y, end.x, end.y);

    if (points.length > 0) {
      let i: number = 0;
      const startIndex: number = findIndex(points, begin);
      const endIndex: number = findIndex(points, end);

      for (i = startIndex + 1; i < endIndex; ++i) {
        this._data[2] = maxInt(this._data[2], this._getC(points[i]));
      }
    }
  }

  public set(x1: number, y1: number, x2: number, y2: number): void {
    this._data[0] = y2 - y1;
    this._data[1] = x1 - x2;
    this._data[2] = -this._data[1] * y1 - this._data[0] * x1;
  }

  public setHorizontal(y: number): void {
    this.set(0, y, 256, y);
  }

  public setVertical(x: number): void {
    this.set(x, 0, x, 256);
  }

  public getIntersectPoint(line: ScreenLine): Point {
    const determinant = this.a * line.b - line.a * this.b;

    const x = Math.round((this.b * line.c - line.b * this.c) / determinant);
    const y = Math.round((line.a * this.c - this.a * line.c) / determinant);

    return new Point(x, y);
  }

  private _getC(point: Point): number {
    return -this._data[1] * point.y - this._data[0] * point.x;
  }

  get a(): number {
    return this._data[0];
  }

  get b(): number {
    return this._data[1];
  }

  get c(): number {
    return this._data[2];
  }
}
