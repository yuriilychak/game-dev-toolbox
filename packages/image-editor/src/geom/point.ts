import { intAbs } from "../math";
import { cycleIndex } from "../utils";

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
    const pointIndices: number = Point.alloc(2);
    const offset1: Point = Point.get(pointIndices, 0).set(point2).sub(point1);
    const offset2: Point = Point.get(pointIndices, 1).set(this).sub(point1);
    const result = intAbs(offset1.cross(offset2)) / offset1.length;

    Point.malloc(pointIndices);

    return result;
  }

  public lineDistance(line: Int32Array): number {
    const a = line[0];
    const b = line[1];
    const c = line[2];
    const numerator = Math.abs(a * this.x + b * this.y + c);
    const denominator = Math.sqrt(a * a + b * b);

    return numerator / denominator;
  }

  public getOnSegment(point1: Point, point2: Point): boolean {
    const pointIndices = Point.alloc(2);
    const offset1 = Point.get(pointIndices, 0).set(point2).sub(point1);
    const offset2 = Point.get(pointIndices, 1).set(this).sub(point1);

    const result: boolean =
      intAbs(offset2.cross(offset1)) <= Number.EPSILON &&
      Math.abs((2 * offset2.dot(offset1)) / offset1.length2 - 1) <= 1;

    Point.malloc(pointIndices);

    return result;
  }

  public getInside(polygon: Point[], isIncludeBorder: boolean = true): boolean {
    const pointCount = polygon.length;
    let result: boolean = false;
    let p1: Point = polygon[0];
    let p2: Point = polygon[0];
    let i: number = 0;

    for (i = 0; i < pointCount; ++i) {
      p1 = polygon[i];
      p2 = polygon[cycleIndex(i, pointCount, 1)];

      if (this.getOnSegment(p1, p2)) {
        return isIncludeBorder;
      }

      if (
        p1.y > this.y !== p2.y > this.y &&
        this.x < ((p2.x - p1.x) * (this.y - p1.y)) / (p2.y - p1.y) + p1.x
      ) {
        result = !result;
      }
    }

    return result;
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

  public static getArea(polygon: Point[]): number {
    const pointCount: number = polygon.length;
    let result: number = 0;
    let i: number = 0;

    for (i = 0; i < pointCount; ++i) {
      result += polygon[cycleIndex(i, pointCount, 1)].cross(polygon[i]);
    }
    return result / 2;
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

  public static alloc(count: number): number {
    let result: number = 0;
    let currentCount: number = 0;
    let freeBits: number = ~this.USED;
    let currentBit: number = 0;

    while (freeBits !== 0) {
      currentBit = 1 << (Point.MAX_BITS - Math.clz32(freeBits));
      result |= currentBit;
      freeBits &= ~currentBit;
      ++currentCount;

      if (currentCount === count) {
        Point.USED |= result;
        return result;
      }
    }

    throw Error("Pool is empty");
  }

  public static malloc(indices: number): void {
    Point.USED &= ~indices;
  }

  public static get(indices: number, index: number): Point {
    let currentIndex: number = 0;
    let bitIndex: number = 0;
    let currentBit: number = 0;
    let currentIndices: number = indices;

    while (currentIndices !== 0) {
      bitIndex = Point.MAX_BITS - Math.clz32(currentIndices);
      currentBit = 1 << bitIndex;

      if (currentIndex === index) {
        return Point.ITEMS[bitIndex];
      }

      currentIndices &= ~currentBit;
      ++currentIndex;
    }

    throw Error(`Can't find point with index ${index}`);
  }

  private static readonly MAX_BITS: number = 31;

  public static POOL_SIZE: number = 32;

  private static ITEMS: Point[] = new Array(Point.POOL_SIZE)
    .fill(null)
    .map(() => new Point());

  private static USED: number = 0;
}
