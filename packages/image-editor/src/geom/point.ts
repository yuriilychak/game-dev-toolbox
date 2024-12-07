import { intAbs } from "../math";

export default class Point {
  private _data: Int32Array = new Int32Array(2);

  constructor(x: number = 0, y: number = 0) {
    this._data[0] = x;
    this._data[1] = y;
  }

  public set(point: Point): Point {
    this._data[0] = point.x;
    this._data[1] = point.y;

    return this;
  }

  public add(point: Point): Point {
    this._data[0] += point.x;
    this._data[1] += point.y;

    return this;
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

  public dot(point: Point): number {
    return this.x * point.x + this.y * point.y;
  }

  public lineDistance(line: Int32Array): number {
    const a = line[0];
    const b = line[1];
    const c = line[2];
    const numerator = Math.abs(a * this.x + b * this.y + c);
    const denominator = Math.sqrt(a * a + b * b);

    return numerator / denominator;
  }

  public distanceSquaredTo(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  public segmentDistance(p1: Point, p2: Point): number {
    const lengthSquared = p1.distanceSquaredTo(p2);

    if (lengthSquared === 0) {
      // p1 і p2 співпадають, повертаємо відстань до однієї точки
      return Math.sqrt(this.distanceSquaredTo(p1));
    }

    // Проекція точки на лінію, нормалізована до [0, 1]
    const t = Math.max(
      0,
      Math.min(
        1,
        ((this.x - p1.x) * (p2.x - p1.x) + (this.y - p1.y) * (p2.y - p1.y)) /
          lengthSquared,
      ),
    );

    // Обчислюємо проєктовану точку
    const projX = p1.x + t * (p2.x - p1.x);
    const projY = p1.y + t * (p2.y - p1.y);

    // Відстань до проєктованої точки
    const dx = this.x - projX;
    const dy = this.y - projY;

    return Math.sqrt(dx * dx + dy * dy);
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

  public get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
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

  public static getDistance(point1: Point, point2: Point): number {
    return Math.sqrt(this.getSqDist(point1, point2));
  }

  public static crossProduct(p1: Point, p2: Point, p3: Point): number {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  public static getLineEquation(
    point1: Point,
    point2: Point,
    result: Int32Array,
  ): void {
    result[0] = point2.y - point1.y;
    result[1] = point1.x - point2.x;
    result[2] = -(result[0] * point1.x + result[1] * point1.y);
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
