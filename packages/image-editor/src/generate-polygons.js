import pngjs from "pngjs";

import {
  createBuilder,
  getDimensions,
  getImageData,
  getPolygon,
  clearBuilder,
} from "../../build/release.js";

const PNG = drawing(pngjs.PNG);

export function splitCoords(coordData, result = new Uint16Array(2)) {
  result[1] = coordData >> 16;
  result[0] = coordData - (result[1] << 16);

  return result;
}

function splitIndices(indexData, result) {
  const clasterSize = 5;
  const doubleClaster = clasterSize << 1;
  result[2] = indexData >> doubleClaster;
  result[1] = (indexData - (result[2] << doubleClaster)) >> clasterSize;
  result[0] =
    indexData - (result[2] << doubleClaster) - (result[1] << clasterSize);
}

function drawTriangle(
  contours,
  indexData,
  indexArray,
  lineColor,
  vertexColor,
  dst,
) {
  splitIndices(indexData, indexArray);

  let i = 0;
  let beginIndex = 0;
  let endIndex = 0;
  const size = indexArray.length;

  for (i = 0; i < size; ++i) {
    beginIndex = indexArray[i] << 1;
    endIndex = indexArray[(i + 1) % size] << 1;

    dst.drawLine(
      contours[beginIndex],
      contours[beginIndex + 1],
      contours[endIndex],
      contours[endIndex + 1],
      lineColor,
    );
    dst.drawPixel(contours[beginIndex], contours[beginIndex + 1], vertexColor);
  }
}

export default function generatePolygons(fileName) {
  fs.createReadStream(`./resources/input/${fileName}`)
    .pipe(new PNG())
    .on("parsed", function () {
      const clasterSize = 4;
      const id = createBuilder(this.data, this.width, this.height, clasterSize);
      const [resultSize] = getDimensions(id);
      const [nextWidth, nextHeight] = splitCoords(resultSize);
      const cropped = getImageData(id);
      const polygonData = getPolygon(id);
      const sizing = polygonData[0];
      const triangleCount = sizing >> 5;
      const pointCount = sizing - (triangleCount << 5);
      const contours = polygonData.slice(1, (pointCount << 1) + 1);
      const triangles = polygonData.slice((pointCount << 1) + 1);
      const dst = new PNG({ width: nextWidth, height: nextHeight });

      dst.data = Buffer.from(cropped);

      let i = 0;

      const vertexColor = [0, 255, 0, 255];
      const lineColor = [0, 128, 0, 255];
      const indexArray = new Uint8Array(3);

      for (i = 0; i < triangleCount; ++i) {
        drawTriangle(
          contours,
          triangles[i],
          indexArray,
          lineColor,
          vertexColor,
          dst,
        );
      }

      clearBuilder(id);

      fs.writeFileSync(
        `./resources/output/${fileName.replace(".png", "")}_triangles.bin`,
        polygonData,
        "binary",
      );

      dst.pack().pipe(fs.createWriteStream(`./resources/output/${fileName}`));
    });
}
