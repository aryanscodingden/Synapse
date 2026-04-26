export function generateSequence(length) {
    const colors = [
        "#ff4d4d",
        "#4dff88",
        "#4da6ff",
        "#ffd24d",
        "#b517b5",
        "#66ffff",
        "#b366ff",
    ]

    const used = new Set();

    return Array.from({length}, () => {
        let id; 
        do {
            id = Math.floor(Math.random() * 16);
        } while (used.has(id));

        used.add(id);

        return {
            id, 
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 300 + Math.random() * 600, 
        };
    });
};
