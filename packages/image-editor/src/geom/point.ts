import { joinCoords } from "../utils";
import { intAbs } from "../math";

export default class Point {
  private _data: Int16Array = new Int16Array(2);

  constructor(x: number = 0, y: number = 0) {
    this._data[0] = x;
    this._data[1] = y;
  }

  public set(point: Point): void {
    this._data[0] = point.x;
    this._data[1] = point.y;
  }

  public export(): number {
    return joinCoords(this._data[0], this._data[1]);
  }

  public clone(): Point {
    return new Point(this._data[0], this._data[1]);
  }

  public getEqual(point: Point): boolean {
    return this._data[0] == point.x && this._data[1] == point.y;
  }

  public setWithOffset(vertex: Point, offset: number): void {
    this._data[0] = vertex.x + Point.getOffsetX(offset);
    this._data[1] = vertex.y + Point.getOffsetY(offset);
  }

  public addIn(point: Point): void {
    this._data[0] += point.x;
    this._data[1] += point.y;
  }

  public get x(): number {
    return this._data[0];
  }

  public set x(value: number) {
    this._data[0] = value;
  }

  public get y(): number {
    return this._data[1];
  }

  public set y(value: number) {
    this._data[1] = value;
  }

  private static getOffsetX(offset: number): number {
    return (offset % 3) - 1;
  }

  private static getOffsetY(offset: number): number {
    return (((offset % 9) / 3) << 0) - 1;
  }

  public static mult(point: Point, multiplier: number): Point {
    return new Point(point.x * multiplier, point.y * multiplier);
  }

  public static add(point1: Point, point2: Point): Point {
    return new Point(point2.x + point1.x, point2.y + point1.y);
  }

  public static abs(point: Point): Point {
    return new Point(intAbs(point.x), intAbs(point.y));
  }

  public static sub(point1: Point, point2: Point): Point {
    return new Point(point2.x - point1.x, point2.y - point1.y);
  }

  public static getSqDist(point1: Point, point2: Point): number {
    const dx: number = point1.x - point2.x;
    const dy: number = point1.y - point2.y;

    return dx * dx + dy * dy;
  }

  public static getSqSegDist(p: Point, p1: Point, p2: Point): number {
    let localX = p1.x;
    let localY = p1.y;
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let t: number;

    if (dx !== 0 || dy !== 0) {
      t = ((p.x - localX) * dx + (p.y - localY) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        localX = p2.x;
        localY = p2.y;
      } else if (t > 0) {
        localX += dx * t;
        localY += dy * t;
      }
    }

    dx = p.x - localX;
    dy = p.y - localY;

    return dx * dx + dy * dy;
  }
}