import ImageData from "../image-data";
import Point from "./point";

function findFirstNoneTransparentPixel(
  imageData: ImageData,
  threshold: number,
): Point {
  let i: number = 0;
  let j: number = 0;
  const height: number = imageData.height;
  const width: number = imageData.width;

  for (i = 0; i < height; ++i) {
    for (j = 0; j < width; ++j) {
      if (imageData.getPixelAlpha(j, i) > threshold) {
        return new Point(j, i);
      }
    }
  }

  return new Point();
}

function inBounds(x: number, y: number, imageData: ImageData): boolean {
  return x > 0 && x < imageData.width - 1 && y > 0 && y < imageData.height - 1;
}

function checkNeigboar(
  x: number,
  y: number,
  imageData: ImageData,
  threshold: number,
  value: number,
): number {
  return inBounds(x, y, imageData) && imageData.getPixelAlpha(x, y) > threshold
    ? value
    : 0;
}

function getSquareValue(
  x: number,
  y: number,
  rect: ImageData,
  threshold: number,
): number {
  /*
     checking the 2x2 pixel grid, assigning these values to each pixel, if not transparent
     +---+---+
     | 1 | 2 |
     +---+---+
     | 4 | 8 | <- current pixel (curx,cury)
     +---+---+
     */
  const sv: number =
    checkNeigboar(x - 1, y - 1, rect, threshold, 1) +
    checkNeigboar(x, y - 1, rect, threshold, 2) +
    checkNeigboar(x - 1, y, rect, threshold, 4) +
    checkNeigboar(x, y, rect, threshold, 8);

  if (sv == 0 || sv == 15) {
    console.log("square value should not be 0, or 15");
  }

  return sv;
}

export default function marchSquare(
  imageData: ImageData,
  threshold: number,
): Array<Point> {
  const start = findFirstNoneTransparentPixel(imageData, threshold);
  let stepx: number = 0;
  let stepy: number = 0;
  let prevx: number = 0;
  let prevy: number = 0;
  let startx: number = start.x;
  let starty: number = start.y;
  let curx: number = startx;
  let cury: number = starty;
  let count: number = 0;
  let problem: boolean = false;
  const case9s: number[] = [];
  const case6s: number[] = [];
  let i: number = 0;
  let sv: number = 0;
  let it: number = 0;
  const _points: Array<Point> = new Array<Point>();

  do {
    sv = getSquareValue(curx, cury, imageData, threshold);
    switch (sv) {
      case 1:
      case 5:
      case 13:
        /* going UP with these cases:
                 1          5           13
                 +---+---+  +---+---+  +---+---+ 
                 | 1 |   |  | 1 |   |  | 1 |   | 
                 +---+---+  +---+---+  +---+---+ 
                 |   |   |  | 4 |   |  | 4 | 8 | 
                 +---+---+  +---+---+  +---+---+
                 */
        stepx = 0;
        stepy = -1;
        break;
      case 8:
      case 10:
      case 11:
        /* going DOWN with these cases:
                 8          10          11
                 +---+---+  +---+---+   +---+---+
                 |   |   |  |   | 2 |   | 1 | 2 |
                 +---+---+  +---+---+   +---+---+
                 |   | 8 |  |   | 8 |   |   | 8 |
                 +---+---+  +---+---+  	+---+---+
                 */
        stepx = 0;
        stepy = 1;
        break;
      case 4:
      case 12:
      case 14:
        /* going LEFT with these cases:
                 4          12          14
                 +---+---+  +---+---+   +---+---+
                 |   |   |  |   |   |   |   | 2 |
                 +---+---+  +---+---+   +---+---+
                 | 4 |   |  | 4 | 8 |   | 4 | 8 |
                 +---+---+  +---+---+  	+---+---+
                 */
        stepx = -1;
        stepy = 0;
        break;
      case 2:
      case 3:
      case 7:
        /* going RIGHT with these cases:
                 2          3           7        
                 +---+---+  +---+---+   +---+---+
                 |   | 2 |  | 1 | 2 |   | 1 | 2 |
                 +---+---+  +---+---+   +---+---+
                 |   |   |  |   |   |   | 4 |   |
                 +---+---+  +---+---+  	+---+---+
                 */
        stepx = 1;
        stepy = 0;
        break;
      case 9:
        /*
                 +---+---+
                 | 1 |   |
                 +---+---+
                 |   | 8 |
                 +---+---+
                 this should normally go UP, but if we already been here, we go down
                */
        //find index from xy;
        i = imageData.getIndexFromPos(curx, cury);
        it = case9s.indexOf(i);
        if (it != -1) {
          //found, so we go down, and delete from case9s;
          stepx = 0;
          stepy = 1;
          case9s.splice(it, 1);
          problem = true;
        } else {
          //not found, we go up, and add to case9s;
          stepx = 0;
          stepy = -1;
          case9s.push(i);
        }
        break;
      case 6:
        /*
                 6
                 +---+---+
                 |   | 2 |
                 +---+---+
                 | 4 |   |
                 +---+---+
                 this normally go RIGHT, but if its coming from UP, it should go LEFT
                 */
        i = imageData.getIndexFromPos(curx, cury);
        it = case6s.indexOf(i);
        if (it != -1) {
          //found, so we go down, and delete from case9s;
          stepx = -1;
          stepy = 0;
          case6s.splice(it, 1);
          problem = true;
        } else {
          //not found, we go up, and add to case9s;
          stepx = 1;
          stepy = 0;
          case6s.push(i);
        }
        break;
      default:
        console.log("this shouldn't happen.");
    }

    curx += stepx;
    cury += stepy;
    if (stepx == prevx && stepy == prevy) {
      _points[_points.length - 1].x = curx;
      _points[_points.length - 1].y = cury;
    } else if (problem) {
      //TODO: we triangulation cannot work collinear points, so we need to modify same point a little
      //TODO: maybe we can detect if we go into a hole and coming back the hole, we should extract those points and remove them
      _points.push(new Point(curx, cury));
    } else {
      _points.push(new Point(curx, cury));
    }

    count++;
    prevx = stepx;
    prevy = stepy;
    problem = false;
  } while (curx != startx || cury != starty);

  return _points;
}
