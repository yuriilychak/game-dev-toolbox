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

  private checkerImage: HTMLImageElement;

  private isImageLoaded: boolean;

  private isPatternLoaded: boolean;

  private imageOffset: Int16Array;

  private checkerPattern: CanvasPattern;

  private worldPatternSize: number;

  constructor() {
    this.image = new Image();
    this.transform = new Float32Array(3);
    this.lastPosition = new Float32Array(2);
    this.imageOffset = new Int16Array(2);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    this.checkerImage = new Image();
    this.checkerImage.src = "assets/checkerPattern256.png";

    this.checkerImage.addEventListener("load", () => {
      this.isPatternLoaded = true;
      this.worldPatternSize = this.checkerImage.width >> 2;
      this.render();
    });

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

      this.imageOffset[0] = -this.file.data.resolution.width >> 1;
      this.imageOffset[1] = -this.file.data.resolution.height >> 1;

      this.addEventListeners();
      this.resetTransform();

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
    if (this.canvas === null || this.context === null) {
      return;
    }

    this.drawCheckers();

    if (this.isImageLoaded) {
      const width = this.file.data.resolution.width;
      const height = this.file.data.resolution.height;
      const screenX = this.worldToScreenX(this.imageOffset[0]);
      const screenY = this.worldToScreenY(this.imageOffset[1]);
      const screenWidth =
        this.worldToScreenX(width + this.imageOffset[0]) - screenX;
      const screenHeight =
        this.worldToScreenY(height + this.imageOffset[1]) - screenY;
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

    this.drawTriangles();
  }

  private drawCheckers(): void {
    if (!this.isPatternLoaded) {
      return;
    }

    if (!this.checkerPattern) {
      this.checkerPattern = this.context.createPattern(
        this.checkerImage,
        "repeat",
      );
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const scale: number = this.scale / 4;

    const offsetX: number = this.worldToScreenX(
      Math.floor(this.screenToWorldX(0) / this.worldPatternSize) *
        this.worldPatternSize,
    );
    const offsetY: number = this.worldToScreenY(
      Math.floor(this.screenToWorldY(0) / this.worldPatternSize) *
        this.worldPatternSize,
    );

    this.context.save();
    this.context.translate(offsetX, offsetY);
    this.context.scale(scale, scale);
    this.context.fillStyle = this.checkerPattern;
    this.context.fillRect(
      0,
      0,
      Math.ceil((this.canvas.width - offsetX) / scale),
      Math.ceil((this.canvas.height - offsetY) / scale),
    );
    this.context.restore();

    const coordX = this.worldToScreenX(0);
    const coordY = this.worldToScreenY(0);

    if (coordX > -1 && coordX < this.canvas.width + 1) {
      this.context.fillRect(coordX - 1, 0, 2, this.canvas.height);
    }

    if (coordY > -1 && coordY < this.canvas.height + 1) {
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

  private drawTriangles(): void {
    this.context.strokeStyle = "lime";

    const pointCount: number = 3;
    let i: number = 0;
    let j: number = 0;
    let indexOffset: number = 0;
    let pointIndex: number = 0;
    let pointX: number = 0;
    let pointY: number = 0;

    for (i = 0; i < this.file.data.triangleCount; ++i) {
      indexOffset = 3 * i;

      this.context.beginPath();

      for (j = 0; j < pointCount; ++j) {
        pointIndex = this.file.data.triangles[indexOffset + j] << 1;
        pointX = this.worldToScreenX(
          this.file.data.polygon[pointIndex] + this.imageOffset[0],
        );
        pointY = this.worldToScreenY(
          this.file.data.polygon[pointIndex + 1] + this.imageOffset[1],
        );

        if (j === 0) {
          this.context.moveTo(pointX, pointY);
        } else {
          this.context.lineTo(pointX, pointY);
        }
      }

      this.context.closePath();
      this.context.stroke();
    }
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
