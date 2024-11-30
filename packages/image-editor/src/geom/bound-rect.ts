import Point from "./point";

export default class BoundRect {
  private data: Uint16Array;

  constructor(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0,
  ) {
    this.data = new Uint16Array(4);

    this.data[0] = left;
    this.data[1] = top;
    this.data[2] = right;
    this.data[3] = bottom;
  }

  public fromPoints(points: Point[]): void {
    const pointCount: number = points.length;
    let i = 0;

    this.data[0] = 2048;
    this.data[1] = 2048;
    this.data[2] = 0;
    this.data[3] = 0;

    for (i = 0; i < pointCount; ++i) {
      this.data[0] = Math.min(points[i].x, this.data[0]);
      this.data[1] = Math.min(points[i].y, this.data[1]);
      this.data[2] = Math.max(points[i].x, this.data[2]);
      this.data[3] = Math.max(points[i].y, this.data[3]);
    }
  }

  public exportPolygon(): Point[] {
    return [
      new Point(this.data[0], this.data[1]),
      new Point(this.data[2], this.data[1]),
      new Point(this.data[2], this.data[3]),
      new Point(this.data[0], this.data[3]),
    ];
  }

  public union(boundRect: BoundRect, isIn: boolean = false): BoundRect {
    if (isIn) {
      this.data[0] = Math.min(this.left, boundRect.left);
      this.data[1] = Math.min(this.top, boundRect.top);
      this.data[2] = Math.max(this.right, boundRect.right);
      this.data[3] = Math.max(this.bottom, boundRect.bottom);

      return this;
    }

    return new BoundRect(
      Math.min(this.left, boundRect.left),
      Math.min(this.top, boundRect.top),
      Math.max(this.right, boundRect.right),
      Math.max(this.bottom, boundRect.bottom),
    );
  }

  public unionSqaureDiff(boundRect: BoundRect): number {
    const unionRect = this.union(boundRect);

    return unionRect.square - this.square - boundRect.square;
  }

  public extend(): void {
    this.data[0] -= 1;
    this.data[1] -= 1;
    this.data[2] += 1;
    this.data[3] += 1;
  }

  public clone(): BoundRect {
    return new BoundRect(
      this.data[0],
      this.data[1],
      this.data[2],
      this.data[3],
    );
  }

  public get left(): number {
    return this.data[0];
  }

  public get top(): number {
    return this.data[1];
  }

  public get right(): number {
    return this.data[2];
  }

  public get bottom(): number {
    return this.data[3];
  }

  public get width(): number {
    return this.data[2] - this.data[0];
  }

  public get height(): number {
    return this.data[3] - this.data[1];
  }

  public get square(): number {
    return this.width * this.height;
  }
}
