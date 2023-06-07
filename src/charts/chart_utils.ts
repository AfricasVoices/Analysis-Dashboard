export function measureTextWidth(text: string, font: string): number {
    const context: CanvasRenderingContext2D = document
        .createElement("canvas")
        .getContext("2d")!;
    context.font = font;
    return context.measureText(text).width;
}
