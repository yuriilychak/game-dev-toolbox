import { WORKER_TYPE } from "../enums";

export default function getWorker(type: WORKER_TYPE): Worker | null {
  switch (type) {
    case WORKER_TYPE.CROP_IMAGE:
      return new Worker(new URL("./crop.worker", import.meta.url), {
        type: "module",
      });
    case WORKER_TYPE.NEST_POLYGONS:
      return new Worker(new URL("./nest.worker", import.meta.url), {
        type: "module",
      });
    case WORKER_TYPE.GENERATE_IMAGE_BOUNDS:
      return new Worker(new URL("./bounds.worker", import.meta.url), {
        type: "module",
      });
    default:
      return null;
  }
}
