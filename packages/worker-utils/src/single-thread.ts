import { WORKER_TYPE } from "./enums";
import getWorker from "./workers";

export default async function singleThread<InputType, OutputType>(
  type: WORKER_TYPE,
  input: InputType,
  transferable: Transferable[] = [],
): Promise<OutputType> {
  try {
    const result = await new Promise<MessageEvent<OutputType>>(
      (resolve, reject) => {
        const worker = getWorker(type);

        worker.onmessage = resolve;
        worker.onerror = reject;

        worker.postMessage(input, transferable);
      },
    );

    return result.data;
  } catch (error) {
    throw new Error(error);
  }
}
