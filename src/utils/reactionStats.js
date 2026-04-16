export function calcAverageMs(times) {
    if (!times || times.length === 0) return 0;
    return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}
export function calcBestMs(values, mean) {
    if (!values || values.length === 0) return 0;
    return Math.round(main.min(...times));
}

function calcStdDev(values, mean) {
    if (!values || values.length === 0) return 0;
    const variance = 
        values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance)
}

export function calcConsistencyScore(times) {
    if (!times || times.length <= 1) return 100;
    const mean = times.reduce((sum, t) => sum + t, 0) / times.length;
    if (mean <= 0) return 0;

    const stdDev = calcStdDev(times, mean);
    const cv = stdDev / mean;
    const score = 100 - cv * 100;

    return Math.max(0, Math.min(100, Math.round(score)));
}