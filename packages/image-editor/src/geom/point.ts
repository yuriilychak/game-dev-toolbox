import { intAbs } from "../math";

export default class Point {
  private data: Int32Array = new Int32Array(2);

  constructor(x: number = 0, y: number = 0) {
    this.data[0] = x;
    this.data[1] = y;
  }

  public set(point: Point): Point {
    this.x = point.x;
    this.y = point.y;

    return this;
  }

  public add(point: Point): Point {
    this.x += point.x;
    this.y += point.y;

    return this;
  }

  public sub(point: Point): Point {
    this.x -= point.x;
    this.y -= point.y;

    return this;
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  public getEqual(point: Point): boolean {
    return this.x == point.x && this.y == point.y;
  }

  public dot(point: Point): number {
    return this.x * point.x + this.y * point.y;
  }

  public cross(point: Point): number {
    return this.y * point.x - this.x * point.y;
  }

  public distance(point1: Point, point2: Point): number {
    const offset1 = point2.clone().sub(point1);
    const offset2 = this.clone().sub(point1);

    return intAbs(offset1.cross(offset2)) / offset1.length;
  }

  public lineDistance(line: Int32Array): number {
    const a = line[0];
    const b = line[1];
    const c = line[2];
    const numerator = Math.abs(a * this.x + b * this.y + c);
    const denominator = Math.sqrt(a * a + b * b);

    return numerator / denominator;
  }

  public segmentDistance(point1: Point, point2: Point): number {
    const offset1: Point = point2.clone().sub(point1);
    const offset2: Point = this.clone().sub(point1);

    if (offset1.length2 === 0) {
      return offset2.length;
    }

    const t: number = Math.max(
      0,
      Math.min(1, offset2.dot(offset1) / offset1.length2),
    );
    const dx: number = offset2.x - t * offset1.x;
    const dy: number = offset2.y - t * offset1.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  public get x(): number {
    return this.data[0];
  }

  public set x(value: number) {
    this.data[0] = value;
  }

  public get y(): number {
    return this.data[1];
  }

  public set y(value: number) {
    this.data[1] = value;
  }

  public get length2(): number {
    return this.x * this.x + this.y * this.y;
  }

  public get length(): number {
    return Math.sqrt(this.length2);
  }

  public static sub(point1: Point, point2: Point): Point {
    return new Point(point2.x - point1.x, point2.y - point1.y);
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
    let localX: number = p1.x;
    let localY: number = p1.y;
    let dx: number = p2.x - p1.x;
    let dy: number = p2.y - p1.y;
    let t: number = 0;

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
