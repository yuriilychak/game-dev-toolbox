import { BOUND } from "../enums";
import { cycleIndex } from "../utils";
import BoundRect from "./bound-rect";
import {
  EXTEND_SIZE,
  MAX_SIMPLIFY_DISTANCE,
  MIN_SQUARE_DIFF,
} from "./constants";
import Point from "./point";
import { getPointIndex, getQuadrilateralArea } from "./utils";

type SqareResult = {
  index: number;
  neighboarIndex: number;
  squareDiff: number;
  current: Point | null;
  neighboar: Point | null;
};

function getSeqareCriterias(
  points: Point[],
  boundRect: BoundRect,
  index: number,
  offset: number,
  threshold: number,
) {
  const pointCount: number = points.length;
  const current: Point = points[index];
  const neighboarIndex: number = cycleIndex(index, pointCount, offset);
  const neighboar1: Point = points[neighboarIndex];
  const neighboar2: Point = points[cycleIndex(index, pointCount, -1 * offset)];
  const neighboar3: Point = points[cycleIndex(index, pointCount, 2 * offset)];
  const initialArea = getQuadrilateralArea(
    neighboar2,
    current,
    neighboar1,
    neighboar3,
  );
  const bounds = boundRect.getSegmentIntersectBounds(current, neighboar1);
  const bondCount: number = bounds.length;
  const result: SqareResult = {
    index,
    neighboarIndex,
    squareDiff: MIN_SQUARE_DIFF,
    current: null,
    neighboar: null,
  };
  let bound: BOUND = BOUND.LEFT;
  let i: number = 0;
  let newCurrent: Point = null;
  let newNeighboar: Point = null;
  let currentArea: number = 0;

  for (i = 0; i < bondCount; ++i) {
    bound = bounds[i];

    if (
      boundRect.contains(neighboar1) &&
      boundRect.getDistance(neighboar1, bound) > threshold
    ) {
      continue;
    }

    newCurrent = boundRect.getIntersection(current, neighboar2, bound);
    newNeighboar = boundRect.getIntersection(neighboar1, neighboar3, bound);

    if (newCurrent === null || newNeighboar === null) {
      continue;
    }

    currentArea = getQuadrilateralArea(
      neighboar2,
      newCurrent,
      newNeighboar,
      neighboar3,
    );

    if (result.squareDiff < initialArea - currentArea) {
      result.squareDiff = initialArea - currentArea;
      result.current = newCurrent;
      result.neighboar = newNeighboar;
    }
  }

  return result;
}

function optimizeSimplifiedContour(
  simplified: Point[],
  original: Point[],
  threshold: number,
): Point[] {
  if (simplified.length <= 4) {
    return simplified;
  }

  const boundRect: BoundRect = BoundRect.fromPoints(original);
  const pointCount: number = simplified.length;
  let currPoint: Point = null;
  let i: number = 0;

  boundRect.extend(EXTEND_SIZE);

  for (i = 0; i < pointCount; ++i) {
    currPoint = simplified[i];

    if (!boundRect.contains(currPoint)) {
      const criteria1 = getSeqareCriterias(
        simplified,
        boundRect,
        i,
        1,
        threshold,
      );
      const criteria2 = getSeqareCriterias(
        simplified,
        boundRect,
        i,
        -1,
        threshold,
      );

      if (
        criteria1.squareDiff === MIN_SQUARE_DIFF &&
        criteria2.squareDiff === MIN_SQUARE_DIFF
      ) {
        continue;
      }

      if (
        criteria1.squareDiff !== MIN_SQUARE_DIFF &&
        criteria2.squareDiff !== MIN_SQUARE_DIFF
      ) {
        simplified[i].x =
          criteria1.current.x === criteria1.neighboar.x
            ? criteria1.current.x
            : criteria2.current.x;
        simplified[i].y =
          criteria1.current.y === criteria1.neighboar.y
            ? criteria1.current.y
            : criteria2.current.y;
        simplified[criteria1.neighboarIndex] = criteria1.neighboar;
        simplified[criteria2.neighboarIndex] = criteria2.neighboar;
      } else if (criteria1.squareDiff > criteria2.squareDiff) {
        simplified[i] = criteria1.current;
        simplified[criteria1.neighboarIndex] = criteria1.neighboar;
      } else {
        simplified[i] = criteria2.current;
        simplified[criteria2.neighboarIndex] = criteria2.neighboar;
      }
    }
  }

  return simplified;
}

function findIntersection(line1: Int32Array, line2: Int32Array): Point | null {
  const [a1, b1, c1] = line1;
  const [a2, b2, c2] = line2;
  const denominator = a1 * b2 - a2 * b1;

  if (denominator === 0) {
    return null;
  }

  const x = -Math.round((b2 * c1 - b1 * c2) / denominator);
  const y = -Math.round((a1 * c2 - a2 * c1) / denominator);

  return new Point(x, y);
}

export default function extend(
  originalContour: Point[],
  simplifiedContour: Point[],
): Point[] {
  const contourSize: number = originalContour.length;
  const polygonSize: number = simplifiedContour.length;
  const firstLine: Int32Array = new Int32Array(3);
  const prevLine: Int32Array = new Int32Array(3);
  const line: Int32Array = new Int32Array(3);
  const result: Point[] = [];
  let intersection: Point = null;
  let point1: Point = null;
  let point2: Point = null;
  let startIndex: number = 0;
  let endIndex: number = 0;
  let isLineInvalid: boolean = false;
  let i: number = 0;
  let j: number = 0;

  for (i = 0; i < polygonSize; ++i) {
    point1 = simplifiedContour[i];
    point2 = simplifiedContour[(i + 1) % polygonSize];
    startIndex = getPointIndex(originalContour, point1);
    endIndex = getPointIndex(originalContour, point2);
    endIndex = startIndex > endIndex ? endIndex + contourSize : endIndex;
    Point.getLineEquation(point2, point1, line);

    isLineInvalid = true;

    while (isLineInvalid) {
      isLineInvalid = false;

      for (j = startIndex; j <= endIndex; ++j) {
        const point = originalContour[j % contourSize];
        const value = line[0] * point.x + line[1] * point.y + line[2];

        if (value < 0 || point.lineDistance(line) < EXTEND_SIZE) {
          line[2] += 1;
          isLineInvalid = true;
          break;
        }
      }
    }

    if (i === 0) {
      firstLine.set(line);
    } else {
      intersection = findIntersection(prevLine, line);

      if (intersection) {
        result.push(intersection);
      }
    }

    prevLine.set(line);
  }

  intersection = findIntersection(firstLine, line);

  if (intersection) {
    result.push(intersection);
  }

  const res = optimizeSimplifiedContour(
    result,
    originalContour,
    MAX_SIMPLIFY_DISTANCE,
  );

  return res;
}
