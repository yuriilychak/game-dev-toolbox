declare module imageEditor {
    export type ImageFileData = {
        buffer: ArrayBuffer;
        type: string;
        label: string;
        size: number;
        index: number;
    };
    export type LibraryImageData = {
        src: ImageBitmap;
        isFixBorder: boolean;
        extension: string;
        inputLabel: string;
        size: number;
        type: number;
        polygons: Uint16Array[];
        triangles: Uint16Array[];
    };
    export function cropImage(
        imageData: ImageFileData,
        context: OffscreenCanvasRenderingContext2D
    ): LibraryImageData;
    export function generateBounds(
        data: LibraryImageData,
        offset: number,
        canvas: OffscreenCanvas,
        context: OffscreenCanvasRenderingContext2D
    ): Promise<void>;
}

declare module geometryUtils {
    export type CalculateConfig = { pointPool: unknown; isInit: boolean };
    export function calculate(
        config: CalculateConfig,
        data: ArrayBuffer
    ): ArrayBuffer;
}
