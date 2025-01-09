import { BOUND } from '../enums';
import Point from './point';

export default class BoundRect {

  private data: Uint16Array;

  private constructor(
    left: number,
    top: number,
    right: number,
    bottom: number
  ) {
    this.data = new Uint16Array(BoundRect.BOUND_COUNT);

    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  public exportPolygon(): Point[] {
    return [
      new Point(this.left, this.top),
      new Point(this.right, this.top),
      new Point(this.right, this.bottom),
      new Point(this.left, this.bottom)
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
      Math.max(this.bottom, boundRect.bottom)
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
    const value: number = BoundRect.getHorizontal(bound)
      ? point.x
      : point.y;

    return Math.abs(value - this.data[bound]);
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

  public getIntersection(p1: Point, p2: Point, bound: BOUND): Point | null {
    const offsetX = p2.x - p1.x;
    const offsetY = p2.y - p1.y;
    const value = this.data[bound];

    if (!BoundRect.getHorizontal(bound)) {
      return offsetY === 0
        ? null
        : new Point(
          p1.x + Math.round(((value - p1.y) * offsetX) / offsetY),
          value
        );
    }

    return offsetX === 0
      ? null
      : new Point(
        value,
        p1.y + Math.round(((value - p1.x) * offsetY) / offsetX)
      );
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

  public create(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0
  ): BoundRect {
    return new BoundRect(left, top, right, bottom);
  }

  public static fromPoints(points: Point[]): BoundRect {
    const pointCount: number = points.length;
    let left = points[0].x;
    let top = points[0].y;
    let right = points[0].x;
    let bottom = points[0].y;
    let i = 0;

    for (i = 1; i < pointCount; ++i) {
      left = Math.min(points[i].x, left);
      top = Math.min(points[i].y, top);
      right = Math.max(points[i].x, right);
      bottom = Math.max(points[i].y, bottom);
    }

    return new BoundRect(left, top, right, bottom);
  }

  public static getHorizontal(bound: BOUND): boolean {
    return bound === BOUND.LEFT || bound === BOUND.RIGHT;
  }

  public static readonly BOUND_COUNT: number = 4;

}
