import { LIBRARY_FILE_TYPE } from "../../../../../enums";
import { LibraryFile } from "../../../../../types";

export default class BoundEditor {
  private file: LibraryFile<LIBRARY_FILE_TYPE.IMAGE> | null = null;

  private canvas: HTMLCanvasElement | null = null;

  private context: CanvasRenderingContext2D;

  private transform: Float32Array;

  private isDragging = false;

  private lastPosition: Float32Array;

  private image: HTMLImageElement;

  private isImageLoaded: boolean;

  private static CHECKER_SIZE = 32;

  constructor() {
    this.image = new Image();
    this.transform = new Float32Array(3);
    this.lastPosition = new Float32Array(2);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    this.transform[2] = 1;
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

  public resetTransform(): void {
    this.transform[0] = this.canvas.width >> 1;
    this.transform[1] = this.canvas.height >> 1;
    this.transform[2] = 1;

    this.render();
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
    const checkerSize: number = BoundEditor.CHECKER_SIZE * this.scale;
    const columnCount: number =
      Math.ceil(this.canvas.width / (checkerSize * 2)) + 1;
    const rowCount: number = Math.ceil(this.canvas.height / checkerSize) + 1;

    const worldX: number = Math.floor(
      this.screenToWorldX(0) / BoundEditor.CHECKER_SIZE,
    );
    const worldY: number = Math.floor(
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
          ((i << 1) + ((j + indexOffset) % 2)) * checkerSize + offsetX,
          j * checkerSize + offsetY,
          checkerSize,
          checkerSize,
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
    return (screenX - this.worldX) / this.scale;
  }

  private screenToWorldY(screenY: number): number {
    return (screenY - this.worldY) / this.scale;
  }

  private worldToScreenX(worldX: number): number {
    return this.worldX + worldX * this.scale;
  }

  private worldToScreenY(worldY: number): number {
    return this.worldY + worldY * this.scale;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);

    this.canvas.addEventListener("touchstart", this.onTouchStart);
    document.addEventListener("touchend", this.onTouchEnd);
    document.addEventListener("touchmove", this.onTouchMove);
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastPosition[0] = event.clientX;
    this.lastPosition[1] = event.clientY;
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isDragging) {
      this.updateWorldoffset(event.clientX, event.clientY);
    }
  };

  private onTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];
    this.isDragging = true;
    this.lastPosition[0] = touch.clientX;
    this.lastPosition[1] = touch.clientY;
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (this.isDragging) {
      const touch = event.touches[0];

      this.updateWorldoffset(touch.clientX, touch.clientY);
    }
  };

  private updateWorldoffset(x: number, y: number): void {
    this.worldX += x - this.lastPosition[0];
    this.worldY += y - this.lastPosition[1];

    this.lastPosition[0] = x;
    this.lastPosition[1] = y;
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

  public get scale(): number {
    return this.transform[2];
  }

  public set scale(value: number) {
    if (this.transform[2] === value) {
      return;
    }

    const oldScale = this.transform[2];

    // Find the center of the screen in screen coordinates
    const screenCenterX = this.canvas.width / 2;
    const screenCenterY = this.canvas.height / 2;

    // Convert the screen center to world coordinates at the old scale
    const worldCenterX = (screenCenterX - this.worldX) / oldScale;
    const worldCenterY = (screenCenterY - this.worldY) / oldScale;

    // Update the scale
    this.transform[2] = value;

    // Convert the world center back to screen coordinates at the new scale
    this.worldX = screenCenterX - worldCenterX * value;
    this.worldY = screenCenterY - worldCenterY * value;

    this.render();
  }

  private get worldX(): number {
    return this.transform[0];
  }

  private set worldX(value: number) {
    this.transform[0] = value;
  }

  private get worldY(): number {
    return this.transform[1];
  }

  private set worldY(value: number) {
    this.transform[1] = value;
  }
}
