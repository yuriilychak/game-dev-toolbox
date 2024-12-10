import { WORKER_TYPE } from "./enums";
import { default as getWorker } from "./workers";

export default class Parallel<InputType, OutputType> {
  #threadsUsage: boolean[];

  #threads: Worker[];

  #input: InputType[] = null;

  #output: OutputType[] = null;

  #threadIndices: number[];

  #isTerminated: boolean = true;

  #iterationCount: number = 0;

  #startedThreads: number = 0;

  #totalThreads: number = 0;

  #type: WORKER_TYPE = WORKER_TYPE.NONE;

  #onError: (error: ErrorEvent) => void = null;

  #onSuccess: (result: OutputType[]) => void = null;

  #onSpawn: (count: number) => void = null;

  #onTrigger: (input: InputType) => Transferable[] = null;

  constructor(type: WORKER_TYPE) {
    this.#type = type;
    this.#threadsUsage = new Array(Parallel.MAX_THREAD_COUNT);
    this.#threads = new Array(Parallel.MAX_THREAD_COUNT);
    this.#threadIndices = new Array(Parallel.MAX_THREAD_COUNT);

    this.#threadsUsage.fill(false);
    this.#threads.fill(null);
    this.#threadIndices.fill(-1);
  }

  public start(
    input: InputType[],
    onSuccess: (result: OutputType[]) => void,
    onError: (error: ErrorEvent) => void,
    onTrigger: (input: InputType) => Transferable[] = () => [],
    onSpawn: (scount: number) => void = null,
  ): boolean {
    if (input.length === 0) {
      this.onError(new ErrorEvent("Empty data"));
      return false;
    }

    this.#onError = onError;
    this.#onSuccess = onSuccess;
    this.#onSpawn = onSpawn;
    this.#onTrigger = onTrigger;
    this.#iterationCount = 0;
    this.#startedThreads = 0;
    this.#input = input;
    this.#totalThreads = input.length;
    this.#output = new Array(this.#totalThreads);
    let i: number = 0;

    this.#threadsUsage.fill(false);
    this.#threadIndices.fill(-1);

    if (this.#isTerminated) {
      for (i = 0; i < Parallel.MAX_THREAD_COUNT; ++i) {
        this.#threads[i] = getWorker(this.#type);
      }

      this.#isTerminated = false;
    }

    while (
      this.#startedThreads < this.#totalThreads &&
      this.#threadsUsage.indexOf(false) !== -1
    ) {
      this.trigger();
    }

    return true;
  }

  public terminate(): void {
    let i: number = 0;

    for (i = 0; i < Parallel.MAX_THREAD_COUNT; ++i) {
      if (this.#threads[i] !== null) {
        this.#threads[i].terminate();
        this.#threads[i] = null;
      }
      this.#threadsUsage[i] = false;
      this.#threadIndices[i] = -1;
    }

    this.#isTerminated = true;
  }

  private trigger(): boolean {
    const index: number = this.#threadsUsage.indexOf(false);

    if (index === -1) {
      return false;
    }

    this.#threadsUsage[index] = true;

    const thread = this.#threads[index];
    const threadIndex: number = this.#startedThreads;

    ++this.#startedThreads;

    this.#threadIndices[index] = threadIndex;

    if (this.#onSpawn !== null) {
      this.#onSpawn(this.#startedThreads);
    }

    const input = this.#input[threadIndex];

    thread.onmessage = this.onMessage;
    thread.onerror = this.onError;
    thread.postMessage(input, this.#onTrigger(input));

    return true;
  }

  private onMessage = (message: MessageEvent<OutputType>) => {
    const index = this.clean(message.currentTarget as Worker);
    const threadIndex = this.#threadIndices[index];

    this.#output[threadIndex] = message.data;

    if (this.#iterationCount === this.#totalThreads) {
      this.#onSuccess(this.#output);
      return;
    }

    if (this.#startedThreads < this.#totalThreads) {
      this.trigger();
    }
  };

  private onError = (error: ErrorEvent) => {
    this.clean(error.currentTarget as Worker);
    this.#onError(error);
  };

  private clean(target: Worker): number {
    let i: number = 0;

    for (i = 0; i < Parallel.MAX_THREAD_COUNT; ++i) {
      if (this.#threads[i] === target) {
        break;
      }
    }

    this.#threadsUsage[i] = false;
    ++this.#iterationCount;

    return i;
  }

  public static readonly MAX_THREAD_COUNT: number =
    navigator.hardwareConcurrency || 4;
}
