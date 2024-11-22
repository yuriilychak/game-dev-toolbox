import { IMAGE_TYPE } from "./enums";
import PolygonGenerator from "./polygon-generator";
import { LibraryFile, LibraryImageData } from "./types";

export default class BoundEditor {
  private file: LibraryFile;

  private imageData: LibraryImageData;

  private canvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private transform: Float32Array;

  private isDragging: boolean = false;

  private lastPosition: Float32Array;

  private checkerBitmap: ImageBitmap;

  private isPatternLoaded: boolean;

  private imageOffset: Int16Array;

  private checkerPattern: CanvasPattern;

  private worldPatternSize: number;

  private offscreenCanvas: OffscreenCanvas;

  private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

  constructor() {
    this.offscreenCanvas = new OffscreenCanvas(2048, 2048);
    this.offscreenCanvasContext = this.offscreenCanvas.getContext("2d");
    this.transform = new Float32Array(3);
    this.lastPosition = new Float32Array(2);
    this.imageOffset = new Int16Array(2);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    fetch("assets/checkerPattern256.png")
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        this.isPatternLoaded = true;
        this.checkerBitmap = bitmap;
        this.worldPatternSize = bitmap.width / BoundEditor.MAX_SCALE;
      });

    this.transform[2] = 1;
  }

  public init(
    file: object,
    canvasRef: { current: HTMLCanvasElement | null },
  ): void {
    if (canvasRef.current) {
      this.file = file as LibraryFile;
      this.imageData = { ...this.file.data };
      this.canvas = canvasRef.current;
      this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

      this.canvas.width = this.canvas.offsetWidth;
      this.canvas.height = this.canvas.offsetHeight;

      this.imageOffset[0] = -this.imageData.src.width >> 1;
      this.imageOffset[1] = -this.imageData.src.height >> 1;

      this.addEventListeners();
      this.resetTransform();

      return;
    }

    setTimeout(() => this.init(file, canvasRef), 100);
  }

  public resetTransform(): void {
    if (this.canvas == null) {
      return;
    }

    this.transform[0] = this.sceneWidth >> 1;
    this.transform[1] = this.sceneHeight >> 1;
    this.transform[2] = 1;

    this.render();
  }

  public async generatePolygon(): Promise<void> {
    this.imageData.type = IMAGE_TYPE.POLYGON;

    if (this.imageData.isFixBorder) {
      await this.fixQuadBorderWithoutRerender(false);
    }

    const polygonGenerator = new PolygonGenerator(
      this.imageData.src,
      this.offscreenCanvasContext,
    );
    const polygonData = polygonGenerator.generate();

    const sizing = polygonData[0];
    const triangleCount = sizing >> 5;
    const pointCount = sizing - (triangleCount << 5);
    const bounds = polygonData.slice(1, 5);
    const contours = polygonData.slice(5, (pointCount << 1) + 5);
    const triangles = polygonData.slice((pointCount << 1) + 5);

    this.imageData.polygons = [contours];
    // this.imageData.triangles = [triangles];

    this.offscreenCanvasContext.clearRect(0, 0, bounds[2], bounds[3]);
    this.offscreenCanvasContext.drawImage(
      this.imageData.src,
      bounds[0],
      bounds[1],
    );

    this.imageData.src = await createImageBitmap(
      this.offscreenCanvas,
      0,
      0,
      bounds[2],
      bounds[3],
    );

    this.imageOffset[0] = -this.imageData.src.width >> 1;
    this.imageOffset[1] = -this.imageData.src.height >> 1;

    this.render();
  }

  public render(): void {
    if (!this.canvas || !this.context) {
      return;
    }

    this.drawCheckers();
    this.drawImage();
    this.drawPolygon();
  }

  public async fixQuadBorder(
    isFixBorder: boolean,
    onSuccess: () => void,
  ): Promise<void> {
    await this.fixQuadBorderWithoutRerender(isFixBorder);

    this.render();

    onSuccess();
  }

  private async fixQuadBorderWithoutRerender(
    isFixBorder: boolean,
  ): Promise<void> {
    const offset: number = isFixBorder ? 1 : -1;
    const newWidth: number = this.imageData.src.width + (offset << 1);
    const newHeight: number = this.imageData.src.height + (offset << 1);

    this.offscreenCanvasContext.clearRect(0, 0, newWidth, newHeight);
    this.offscreenCanvasContext.drawImage(this.imageData.src, offset, offset);

    this.imageData.isFixBorder = isFixBorder;
    this.imageData.src = await createImageBitmap(
      this.offscreenCanvas,
      0,
      0,
      newWidth,
      newHeight,
    );
    this.imageOffset[0] = -this.imageData.src.width >> 1;
    this.imageOffset[1] = -this.imageData.src.height >> 1;
  }

  private drawImage(): void {
    const width: number = this.imageData.src.width;
    const height: number = this.imageData.src.height;
    const screenX: number = this.worldToScreenX(this.imageOffset[0]);
    const screenY: number = this.worldToScreenY(this.imageOffset[1]);
    const screenWidth: number =
      this.worldToScreenX(width + this.imageOffset[0]) - screenX;
    const screenHeight: number =
      this.worldToScreenY(height + this.imageOffset[1]) - screenY;
    this.context.drawImage(
      this.imageData.src,
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

  private drawCheckers(): void {
    if (!this.isPatternLoaded || !this.canvas) {
      return;
    }

    if (!this.checkerPattern) {
      this.checkerPattern = this.context.createPattern(
        this.checkerBitmap,
        "repeat",
      ) as CanvasPattern;
    }

    this.context.clearRect(0, 0, this.sceneWidth, this.sceneHeight);

    const scale: number = this.scale / BoundEditor.MAX_SCALE;
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
      Math.ceil((this.sceneWidth - offsetX) / scale),
      Math.ceil((this.sceneHeight - offsetY) / scale),
    );
    this.context.restore();

    const coordX: number = this.worldToScreenX(0);
    const coordY: number = this.worldToScreenY(0);

    if (coordX > -1 && coordX < this.sceneWidth) {
      this.context.fillRect(coordX - 1, 0, 2, this.sceneHeight);
    }

    if (coordY > -1 && coordY < this.sceneHeight) {
      this.context.fillRect(0, coordY - 1, this.sceneWidth, 2);
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

  private drawPolygon(): void {
    const polygon = this.imageData.polygons[0];
    const pointCount: number = polygon.length >> 1;
    let i: number = 0;
    let pointX: number = 0;
    let pointY: number = 0;
    let pointIndex: number = 0;

    this.context.strokeStyle = "lime";

    this.context.beginPath();

    for (i = 0; i < pointCount; ++i) {
      pointIndex = i << 1;
      pointX = this.worldToScreenX(polygon[pointIndex] + this.imageOffset[0]);
      pointY = this.worldToScreenY(
        polygon[pointIndex + 1] + this.imageOffset[1],
      );

      if (i === 0) {
        this.context.moveTo(pointX, pointY);
      } else {
        this.context.lineTo(pointX, pointY);
      }
    }

    this.context.closePath();
    this.context.stroke();
  }

  private drawTriangles(): void {
    const triangles = this.imageData.triangles[0];
    const polygon = this.imageData.polygons[0];
    const pointCount: number = 3;
    let i: number = 0;
    let j: number = 0;
    let indexOffset: number = 0;
    let pointIndex: number = 0;
    let pointX: number = 0;
    let pointY: number = 0;

    this.context.strokeStyle = "lime";

    for (i = 0; i < this.imageData.triangleCount; ++i) {
      indexOffset = 3 * i;

      this.context.beginPath();

      for (j = 0; j < pointCount; ++j) {
        pointIndex = triangles[indexOffset + j] << 1;
        pointX = this.worldToScreenX(polygon[pointIndex] + this.imageOffset[0]);
        pointY = this.worldToScreenY(
          polygon[pointIndex + 1] + this.imageOffset[1],
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
    this.updateLastOffset(event.clientX, event.clientY);
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (this.isDragging) {
      this.updateWorldOffset(event.clientX, event.clientY);
    }
  };

  private onTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];

    this.isDragging = true;
    this.updateLastOffset(touch.clientX, touch.clientY);
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (this.isDragging) {
      const touch = event.touches[0];

      this.updateWorldOffset(touch.clientX, touch.clientY);
    }
  };

  private updateWorldOffset(x: number, y: number): void {
    this.worldX += x - this.lastPosition[0];
    this.worldY += y - this.lastPosition[1];
    this.updateLastOffset(x, y);

    this.render();
  }

  private updateLastOffset(x: number, y: number): void {
    this.lastPosition[0] = x;
    this.lastPosition[1] = y;
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

    const screenCenterX: number = this.sceneWidth >> 1;
    const screenCenterY: number = this.sceneHeight >> 1;
    const worldCenterX: number = (screenCenterX - this.worldX) / this.scale;
    const worldCenterY: number = (screenCenterY - this.worldY) / this.scale;

    this.transform[2] = value;
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

  private get sceneWidth(): number {
    return this.canvas.width;
  }

  private get sceneHeight(): number {
    return this.canvas.height;
  }

  private static MAX_SCALE: number = 4;
}
