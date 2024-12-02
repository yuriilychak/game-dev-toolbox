import { BOUND } from "../enums";
import Point from "./point";

export default class BoundRect {
  private data: Uint16Array;

  constructor(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0,
  ) {
    this.data = new Uint16Array(BoundRect.BOUND_COUNT);

    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  public fromPoints(points: Point[]): void {
    const pointCount: number = points.length;
    let i = 0;

    this.left = points[0].x;
    this.top = points[0].y;
    this.right = points[0].x;
    this.bottom = points[0].y;

    for (i = 1; i < pointCount; ++i) {
      this.left = Math.min(points[i].x, this.left);
      this.top = Math.min(points[i].y, this.top);
      this.right = Math.max(points[i].x, this.right);
      this.bottom = Math.max(points[i].y, this.bottom);
    }
  }

  public exportPolygon(): Point[] {
    return [
      new Point(this.left, this.top),
      new Point(this.right, this.top),
      new Point(this.right, this.bottom),
      new Point(this.left, this.bottom),
    ];
  }

  public union(boundRect: BoundRect, isIn: boolean = false): BoundRect {
    if (isIn) {
      this.left = Math.min(this.left, boundRect.left);
      this.top = Math.min(this.top, boundRect.top);
      this.right = Math.max(this.right, boundRect.right);
      this.bottom = Math.max(this.bottom, boundRect.bottom);

      return this;
    }

    return new BoundRect(
      Math.min(this.left, boundRect.left),
      Math.min(this.top, boundRect.top),
      Math.max(this.right, boundRect.right),
      Math.max(this.bottom, boundRect.bottom),
    );
  }

  public contains(point: Point): boolean {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  public getDistance(point: Point, bound: BOUND): number {
    const value: number = BoundRect.getHorizontal(bound) ? point.x : point.y;

    return Math.abs(value - this.data[bound]);
  }

  public getIntersection(p1: Point, p2: Point, bound: BOUND): Point | null {
    switch (bound) {
      case BOUND.LEFT:
        return BoundRect.getLineIntersection(
          p1,
          p2,
          new Point(this.left, this.top),
          new Point(this.left, this.bottom),
        );
      case BOUND.TOP:
        return BoundRect.getLineIntersection(
          p1,
          p2,
          new Point(this.left, this.top),
          new Point(this.right, this.top),
        );
      case BOUND.RIGHT:
        return BoundRect.getLineIntersection(
          p1,
          p2,
          new Point(this.right, this.top),
          new Point(this.right, this.bottom),
        );
      case BOUND.BOTTOM:
        return BoundRect.getLineIntersection(
          p1,
          p2,
          new Point(this.left, this.bottom),
          new Point(this.right, this.bottom),
        );
      default:
        return null;
    }
  }

  public unionSqaureDiff(boundRect: BoundRect): number {
    const unionRect = this.union(boundRect);

    return unionRect.square - this.square - boundRect.square;
  }

  public extend(offset: number = 1): void {
    this.left -= offset;
    this.top -= offset;
    this.right += offset;
    this.bottom += offset;
  }

  public getSegmentIntersectBounds(p1: Point, p2: Point): BOUND[] {
    const result: BOUND[] = [];
    let intersection: Point = null;
    let i: BOUND = BOUND.LEFT;

    for (i = BOUND.LEFT; i < BoundRect.BOUND_COUNT; ++i) {
      intersection = this.getIntersection(p1, p2, i);

      if (intersection !== null && this.contains(intersection)) {
        result.push(i);
      }
    }

    return result;
  }

  public clone(): BoundRect {
    return new BoundRect(this.left, this.top, this.right, this.bottom);
  }

  public get left(): number {
    return this.data[BOUND.LEFT];
  }

  private set left(value: number) {
    this.data[BOUND.LEFT] = value;
  }

  public get top(): number {
    return this.data[BOUND.TOP];
  }

  private set top(value: number) {
    this.data[BOUND.TOP] = value;
  }

  public get right(): number {
    return this.data[BOUND.RIGHT];
  }

  private set right(value: number) {
    this.data[BOUND.RIGHT] = value;
  }

  public get bottom(): number {
    return this.data[BOUND.BOTTOM];
  }

  private set bottom(value: number) {
    this.data[BOUND.BOTTOM] = value;
  }

  public get width(): number {
    return this.right - this.left;
  }

  public get height(): number {
    return this.bottom - this.top;
  }

  public get square(): number {
    return this.width * this.height;
  }

  public static fromPoints(points: Point[]): BoundRect {
    const result = new BoundRect();

    result.fromPoints(points);

    return result;
  }

  public static getHorizontal(bound: BOUND): boolean {
    return bound === BOUND.LEFT || bound === BOUND.RIGHT;
  }

  public static readonly BOUND_COUNT: number = 4;

  public static getLineIntersection(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
  ): Point | null {
    // Координати точок
    const a1 = p2.y - p1.y;
    const b1 = p1.x - p2.x;
    const c1 = a1 * p1.x + b1 * p1.y;

    const a2 = p4.y - p3.y;
    const b2 = p3.x - p4.x;
    const c2 = a2 * p3.x + b2 * p3.y;

    // Визначник
    const determinant = a1 * b2 - a2 * b1;

    // Якщо визначник дорівнює 0, прямі паралельні або співпадають
    if (determinant === 0) {
      return null;
    }

    // Обчислення координат точки перетину
    const x = (b2 * c1 - b1 * c2) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;

    return new Point(x, y);
  }
}
