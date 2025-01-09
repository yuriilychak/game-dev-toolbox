import { prepareWorker } from './utils';

prepareWorker(self, 'geometry-utils');

const config: geometryUtils.CalculateConfig = {
  isInit: false,
  pointPool: null
};

self.onmessage = (event: MessageEvent<ArrayBuffer>) => {
  const buffer = geometryUtils.calculate(config, event.data);

  // @ts-expect-error Typings issue
  self.postMessage(buffer, [buffer]);
};
