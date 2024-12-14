import { WORKER_TYPE } from "./enums";
import { default as getWorker } from "./workers";

export default class Parallel<InputType, OutputType> {
  #threadsUsage: boolean[] = new Array(Parallel.THREAD_COUNT);

  #threads: Worker[] = new Array(Parallel.THREAD_COUNT);

  #input: InputType[] = null;

  #output: OutputType[] = null;

  #threadIndices: Uint8Array = new Uint8Array(Parallel.THREAD_COUNT);

  #isTerminated: boolean = true;

  #threadData: Uint16Array = new Uint16Array(3);

  #type: WORKER_TYPE = WORKER_TYPE.NONE;

  #onError: (error: ErrorEvent) => void = null;

  #onSuccess: (result: OutputType[]) => void = null;

  #onSpawn: (spawned: number, completed: number) => void = null;

  #onTrigger: (input: InputType) => Transferable[] = null;

  constructor(type: WORKER_TYPE) {
    this.#type = type;
  }

  public start(
    input: InputType[],
    onSuccess: (result: OutputType[]) => void,
    onError: (error: ErrorEvent) => void,
    onTrigger: (input: InputType) => Transferable[] = () => [],
    onSpawn: (spawned: number, completed: number) => void = null,
  ): boolean {
    if (input.length === 0) {
      this.onError(new ErrorEvent("Empty data"));
      return false;
    }

    this.cleanup();

    this.totalThreads = input.length;
    this.#onError = onError;
    this.#onSuccess = onSuccess;
    this.#onSpawn = onSpawn;
    this.#onTrigger = onTrigger;
    this.#input = input;
    this.#output = new Array(this.totalThreads);

    let i: number = 0;

    if (this.#isTerminated) {
      for (i = 0; i < Parallel.THREAD_COUNT; ++i) {
        this.#threads[i] = getWorker(this.#type);
      }

      this.#isTerminated = false;
    }

    while (this.hasFreeThreads) {
      this.trigger();
    }

    return true;
  }

  public terminate(): void {
    let i: number = 0;

    for (i = 0; i < Parallel.THREAD_COUNT; ++i) {
      if (this.#threads[i] !== null) {
        this.#threads[i].terminate();
      }
    }

    this.cleanup();
  }

  private trigger(): boolean {
    if (!this.hasFreeThreads) {
      return false;
    }

    const index: number = this.#threadsUsage.indexOf(false);

    this.#threadsUsage[index] = true;

    const thread = this.#threads[index];
    const threadIndex: number = this.startedThreads;

    ++this.startedThreads;

    this.#threadIndices[index] = threadIndex + 1;

    if (this.#onSpawn !== null) {
      this.#onSpawn(this.startedThreads, this.iterationCount);
    }

    const input = this.#input[threadIndex];

    thread.onmessage = this.onMessage;
    thread.onerror = this.onError;
    thread.postMessage(input, this.#onTrigger(input));

    return true;
  }

  private onMessage = (message: MessageEvent<OutputType>) => {
    const index = this.clean(message.currentTarget as Worker);
    const threadIndex = this.#threadIndices[index] - 1;

    this.#output[threadIndex] = message.data;

    if (this.isComplete) {
      this.#onSuccess(this.#output);
      this.cleanup();

      return;
    }

    if (this.hasFreeThreads) {
      this.trigger();
    }
  };

  private onError = (error: ErrorEvent) => {
    this.clean(error.currentTarget as Worker);
    this.#onError(error);
  };

  private clean(target: Worker): number {
    let i: number = 0;

    for (i = 0; i < Parallel.THREAD_COUNT; ++i) {
      if (this.#threads[i] === target) {
        break;
      }
    }

    this.#threadsUsage[i] = false;
    ++this.iterationCount;

    return i;
  }

  private cleanup(): void {
    this.#isTerminated = true;
    this.#onError = null;
    this.#onSuccess = null;
    this.#onSpawn = null;
    this.#onTrigger = null;
    this.#input = null;
    this.#output = null;
    this.#threadsUsage.fill(false);
    this.#threads.fill(null);
    this.#threadData.fill(0);
    this.#threadIndices.fill(0);
  }

  private get totalThreads(): number {
    return this.#threadData[0];
  }

  private set totalThreads(value: number) {
    this.#threadData[0] = value;
  }

  private get startedThreads(): number {
    return this.#threadData[1];
  }

  private set startedThreads(value: number) {
    this.#threadData[1] = value;
  }

  private get iterationCount(): number {
    return this.#threadData[2];
  }

  private set iterationCount(value: number) {
    this.#threadData[2] = value;
  }

  private get hasFreeThreads(): boolean {
    return (
      this.startedThreads < this.totalThreads &&
      this.#threadsUsage.includes(false)
    );
  }

  private get isComplete(): boolean {
    return this.iterationCount === this.totalThreads;
  }

  public static readonly MIN_THREAD_COUNT = 4;

  public static readonly MAX_THREAD_COUNT = 32;

  public static readonly THREAD_COUNT: number = Math.min(
    navigator.hardwareConcurrency || Parallel.MIN_THREAD_COUNT,
    Parallel.MAX_THREAD_COUNT,
  );
}
