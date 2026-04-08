export function generateSequence(length) {
    const colors = [
        "#ff4d4d",
        "#4dff88",
        "#4da6ff",
        "#ffd24d",
        "#b517b5",
        "#66ffff",
        "#b366ff",
    ];

    return Array.from({ length }, () => ({
        id: Math.floor(Math.random() * 16),
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 300 + Math.random() * 600,
    }));
}