import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { LibraryFile } from "../../../../../types";

export default class BoundEditor {
  private file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE> | null = null;

  private canvas: HTMLCanvasElement | null = null;

  private context: CanvasRenderingContext2D;

  private transform: Float32Array;

  private isDragging = false;

  private lastPosition: { x: number; y: number } | null = null;

  private image: HTMLImageElement;

  private isImageLoaded: boolean;

  private static CHECKER_SIZE = 32;

  constructor() {
    this.image = new Image();
    this.transform = new Float32Array(3);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
  }

  public init(
    file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE>,
    canvasRef: { current: HTMLCanvasElement | null },
  ): void {
    if (canvasRef.current) {
      this.file = file;
      this.canvas = canvasRef.current;
      this.context = this.canvas.getContext("2d");
      this.isImageLoaded = false;

      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;

      this.transform[0] = this.canvas.width >> 1;
      this.transform[1] = this.canvas.height >> 1;
      this.transform[2] = 1;

      this.addEventListeners();
      this.render();

      this.image.src = this.file.data.src;
      this.image.addEventListener("load", () => {
        this.isImageLoaded = true;
        this.render();
      });

      return;
    }

    setTimeout(() => this.init(file, canvasRef), 100);
  }

  private render(): void {
    this.drawCheckers();

    if (this.isImageLoaded) {
      const width = this.file.data.resolution.width;
      const height = this.file.data.resolution.height;
      const screenX = this.worldToScreenX(-width >> 1);
      const screenY = this.worldToScreenY(-height >> 1);
      const screenWidth = this.worldToScreenX(width - (width >> 1)) - screenX;
      const screenHeight =
        this.worldToScreenY(height - (height >> 1)) - screenY;
      this.context.drawImage(
        this.image,
        0,
        0,
        width,
        height,
        screenX,
        screenY,
        screenWidth,
        screenHeight,
      );
    }
  }

  private drawCheckers(): void {
    if (!this.canvas || !this.context) return;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#707070";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#808080";
    const columnCount =
      Math.ceil(this.canvas.width / (BoundEditor.CHECKER_SIZE << 1)) + 1;
    const rowCount =
      Math.ceil(this.canvas.height / BoundEditor.CHECKER_SIZE) + 1;

    const worldX = Math.floor(
      this.screenToWorldX(0) / BoundEditor.CHECKER_SIZE,
    );
    const worldY = Math.floor(
      this.screenToWorldY(0) / BoundEditor.CHECKER_SIZE,
    );
    const offsetX = this.worldToScreenX(worldX * BoundEditor.CHECKER_SIZE);
    const offsetY = this.worldToScreenY(worldY * BoundEditor.CHECKER_SIZE);
    const indexOffset = (worldX % 2) + (worldY % 2) + 2;
    let i: number = 0;
    let j: number = 0;

    for (i = 0; i < columnCount; ++i) {
      for (j = 0; j < rowCount; ++j) {
        this.context.fillRect(
          ((i << 1) + ((j + indexOffset) % 2)) * BoundEditor.CHECKER_SIZE +
            offsetX,
          j * BoundEditor.CHECKER_SIZE + offsetY,
          BoundEditor.CHECKER_SIZE,
          BoundEditor.CHECKER_SIZE,
        );
      }
    }

    this.context.fillStyle = "#000";

    const coordX = this.worldToScreenX(0);
    const coordY = this.worldToScreenY(0);

    if (coordX > -1 && worldX < this.canvas.width + 1) {
      this.context.fillRect(coordX - 1, 0, 2, this.canvas.height);
    }

    if (coordY > -1 && worldY < this.canvas.height + 1) {
      this.context.fillRect(0, coordY - 1, this.canvas.width, 2);
    }
  }

  private screenToWorldX(screenX: number): number {
    return (screenX - this.transform[0]) / this.transform[2];
  }

  private screenToWorldY(screenY: number): number {
    return (screenY - this.transform[1]) / this.transform[2];
  }

  private worldToScreenX(worldX: number): number {
    return this.transform[0] + worldX * this.transform[2];
  }

  private worldToScreenY(worldY: number): number {
    return this.transform[1] + worldY * this.transform[2];
  }

  private addEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);

    // Touch events
    this.canvas.addEventListener("touchstart", this.onTouchStart);
    document.addEventListener("touchend", this.onTouchEnd);
    document.addEventListener("touchmove", this.onTouchMove);
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastPosition = { x: event.clientX, y: event.clientY };
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
    this.lastPosition = null;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isDragging && this.lastPosition) {
      const dx = event.clientX - this.lastPosition.x;
      const dy = event.clientY - this.lastPosition.y;

      this.updatePatternOffset(dx, dy);
      this.lastPosition = { x: event.clientX, y: event.clientY };
    }
  };

  private onTouchStart = (event: TouchEvent): void => {
    this.isDragging = true;
    const touch = event.touches[0];
    this.lastPosition = { x: touch.clientX, y: touch.clientY };
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
    this.lastPosition = null;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (this.isDragging && this.lastPosition) {
      const touch = event.touches[0];
      const dx = touch.clientX - this.lastPosition.x;
      const dy = touch.clientY - this.lastPosition.y;

      this.updatePatternOffset(dx, dy);
      this.lastPosition = { x: touch.clientX, y: touch.clientY };
    }
  };

  private updatePatternOffset(dx: number, dy: number): void {
    this.transform[0] += dx;
    this.transform[1] += dy;
    this.render();
  }

  public destroy(): void {
    if (!this.canvas) {
      return;
    }

    // Remove event listeners when the component is unmounted or the instance is destroyed
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);

    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("touchmove", this.onTouchMove);
  }
}
