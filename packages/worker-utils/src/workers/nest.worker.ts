import { prepareWorker } from "./utils";

declare module geometryUtils {
  export type CalculateConfig = { pointPool: unknown; isInit: boolean };
  export function calculate(
    config: CalculateConfig,
    data: ArrayBuffer,
  ): ArrayBuffer;
}

prepareWorker(self, "geometry-utils");

const config: geometryUtils.CalculateConfig = {
  isInit: false,
  pointPool: null,
};

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const buffer = geometryUtils.calculate(config, event.data);

  //@ts-ignore
  self.postMessage(buffer, [buffer]);
};
