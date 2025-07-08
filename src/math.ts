export function round(number: number, digits = 0): number {
    if (digits < 0) {
        throw new Error("Invalid argument: digits");
    }
    const isNegavite = number < 0;
    const epsilon = Number.EPSILON * (isNegavite ? -1 : 1);

    if (digits == 0) {
        return Math.round(number + epsilon);
    }

    const factor = Math.pow(10, digits);
    // const _digits = +padEnd("1", digits + 1, "0");
    return Math.round((number + epsilon) * factor) / factor;
}