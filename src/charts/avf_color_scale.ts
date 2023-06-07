const AVF_COLOR_SCALE: string[] = [
    "#55949F",
    "#EBB044",
    "#843A39",
    "#75563B",
    "#E0C99D",
    "#AF6F57",
    "#B6A551",
];

export default AVF_COLOR_SCALE;

/**
 *
 *
 * @param length
 */
export function getRepeatingAVFColorScale(length: number): string[] {
    let output: string[] = [];
    for (let i = 0; i < length; i++) {
        output.push(AVF_COLOR_SCALE[i % AVF_COLOR_SCALE.length]!);
    }
    return output;
}
