import ImageData from "../image-data";
import Point from "./point";
import ScreenLine from "./screen-line";

function alignIndex(index: number, size: number): number {
  return (index + size) % size;
}

function simplifyBound(
  startIndex: number,
  endIndex: number,
  spliceIndex: number,
  points: Point[],
  bound: ScreenLine,
): void {
  const pointCount: number = points.length;
  points[alignIndex(startIndex, pointCount)] = bound.getIntersectPoint(
    new ScreenLine(
      points[alignIndex(startIndex, pointCount)],
      points[alignIndex(endIndex, pointCount)],
      [],
    ),
  );

  points.splice(alignIndex(spliceIndex, pointCount), 1);
}

function checkBound(
  points: Point[],
  bound: ScreenLine,
  index: number,
  upData: number,
  downData: number,
  threshold: number = 16,
): boolean {
  if (upData < threshold) {
    simplifyBound(index - 1, index - 2, index, points, bound);
    return true;
  }

  if (downData < threshold) {
    simplifyBound(index + 2, index + 3, index + 1, points, bound);
    return true;
  }

  return false;
}

export default function extend(
  polygon: Array<Point>,
  contour: Array<Point>,
  imageData: ImageData,
): Array<Point> {
  let i: number = 0;
  const size: number = polygon.length - 1;
  const lines: Array<ScreenLine> = new Array<ScreenLine>();

  for (i = 0; i < size; ++i) {
    lines.push(new ScreenLine(polygon[i], polygon[i + 1], contour));
  }

  const result: Array<Point> = new Array<Point>();

  let point: Point;

  let currentLine: ScreenLine;
  let nextLine: ScreenLine;
  const leftBound = new ScreenLine(new Point(0, 0), new Point(0, 256), []);
  const rightBound = new ScreenLine(
    new Point(imageData.width - 1, 0),
    new Point(imageData.width - 1, 256),
    [],
  );
  const topBound = new ScreenLine(new Point(0, 0), new Point(256, 0), []);
  const boottomBound = new ScreenLine(
    new Point(0, imageData.height - 1),
    new Point(256, imageData.height - 1),
    [],
  );

  let canSimplify: boolean = false;

  for (i = 0; i < size; ++i) {
    currentLine = lines[i];
    nextLine = lines[(i + 1) % size];

    point = currentLine.getIntersectPoint(nextLine);

    if (point.x <= 0) {
      result.push(currentLine.getIntersectPoint(leftBound));
      result.push(nextLine.getIntersectPoint(leftBound));
      canSimplify = true;
    } else if (point.y <= 0) {
      result.push(currentLine.getIntersectPoint(topBound));
      result.push(nextLine.getIntersectPoint(topBound));
      canSimplify = true;
    } else if (point.x - imageData.width >= 0) {
      result.push(currentLine.getIntersectPoint(rightBound));
      result.push(nextLine.getIntersectPoint(rightBound));
      canSimplify = true;
    } else if (point.y - imageData.height >= 0) {
      result.push(currentLine.getIntersectPoint(boottomBound));
      result.push(nextLine.getIntersectPoint(boottomBound));
      canSimplify = true;
    } else {
      result.push(point);
    }
  }

  let pointCount: number = 0;
  let currentPoint: Point;
  let nextPoint: Point;
  let beginPoint: Point;
  let endPoint: Point;

  while (canSimplify) {
    canSimplify = false;

    pointCount = result.length;

    for (i = 0; i < pointCount; ++i) {
      beginPoint = result[(i - 1 + pointCount) % pointCount];
      currentPoint = result[i];
      nextPoint = result[(i + 1) % pointCount];
      endPoint = result[(i + 2) % pointCount];

      if (currentPoint.x === 0 && nextPoint.x === 0) {
        canSimplify = checkBound(
          result,
          leftBound,
          i,
          beginPoint.x,
          endPoint.x,
        );

        if (canSimplify) {
          break;
        }
      }

      if (
        currentPoint.x === imageData.width - 1 &&
        nextPoint.x === imageData.width - 1
      ) {
        canSimplify = checkBound(
          result,
          rightBound,
          i,
          imageData.width - 1 - beginPoint.x,
          imageData.width - 1 - endPoint.x,
        );

        if (canSimplify) {
          break;
        }
      }

      if (currentPoint.y === 0 && nextPoint.y === 0) {
        canSimplify = checkBound(result, topBound, i, beginPoint.y, endPoint.y);

        if (canSimplify) {
          break;
        }
      }

      if (
        currentPoint.y === imageData.height - 1 &&
        nextPoint.y === imageData.height - 1
      ) {
        canSimplify = checkBound(
          result,
          boottomBound,
          i,
          imageData.height - 1 - beginPoint.y,
          imageData.height - 1 - endPoint.y,
        );

        if (canSimplify) {
          break;
        }
      }
    }
  }

  pointCount = result.length;

  for (i = 0; i < pointCount; ++i) {
    beginPoint = result[(i - 1 + pointCount) % pointCount];
    currentPoint = result[i];
    nextPoint = result[(i + 1) % pointCount];
    endPoint = result[(i + 2) % pointCount];

    if (currentPoint.x === 0 && nextPoint.x === 0) {
      currentLine = new ScreenLine(beginPoint, currentPoint);
      nextLine = new ScreenLine(
        new Point(imageData.leftOffset, 0),
        new Point(imageData.leftOffset, 256),
      );

      result[i] = currentLine.getIntersectPoint(nextLine);

      currentLine = new ScreenLine(nextPoint, endPoint);

      result[(i + 1) % pointCount] = currentLine.getIntersectPoint(nextLine);
    } else if (currentPoint.y === 0 && nextPoint.y === 0) {
      currentLine = new ScreenLine(beginPoint, currentPoint);
      nextLine = new ScreenLine(
        new Point(0, imageData.topOffset),
        new Point(256, imageData.topOffset),
      );

      result[i] = currentLine.getIntersectPoint(nextLine);

      currentLine = new ScreenLine(nextPoint, endPoint);

      result[(i + 1) % pointCount] = currentLine.getIntersectPoint(nextLine);
    } else if (
      currentPoint.y === imageData.height - 1 &&
      nextPoint.y === imageData.height - 1
    ) {
      currentLine = new ScreenLine(beginPoint, currentPoint);
      nextLine = new ScreenLine(
        new Point(0, imageData.height - 1 - imageData.bottomOffset),
        new Point(256, imageData.height - 1 - imageData.bottomOffset),
      );

      result[i] = currentLine.getIntersectPoint(nextLine);

      currentLine = new ScreenLine(nextPoint, endPoint);

      result[(i + 1) % pointCount] = currentLine.getIntersectPoint(nextLine);
    } else if (
      currentPoint.x === imageData.width - 1 &&
      nextPoint.x === imageData.width - 1
    ) {
      currentLine = new ScreenLine(beginPoint, currentPoint);
      nextLine = new ScreenLine(
        new Point(imageData.width - 1 - imageData.rightOffset, 0),
        new Point(imageData.width - 1 - imageData.rightOffset, 256),
      );

      result[i] = currentLine.getIntersectPoint(nextLine);

      currentLine = new ScreenLine(nextPoint, endPoint);

      result[(i + 1) % pointCount] = currentLine.getIntersectPoint(nextLine);
    }
  }

  return result;
}
