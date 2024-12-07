import { optimizeSimplifiedPolygon } from "./optimization";
import { bufferToContour, contourToBuffer } from "./utils";

self.onmessage = async function (
  e: MessageEvent<{ contour: ArrayBuffer; polygon: ArrayBuffer }>,
) {
  const contour = bufferToContour(e.data.contour);
  const polygon = bufferToContour(e.data.polygon);
  const optimizedPolygon = optimizeSimplifiedPolygon(polygon, contour);
  const result = contourToBuffer(optimizedPolygon);

  // @ts-ignore
  self.postMessage(result, [result]);
};
