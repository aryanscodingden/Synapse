const STORAGE_KEY = "synapse_reaction_session_v1";

function readAll() {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
        const parse = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];

    } catch {
        return [];
    }
}

function writeAll(rows) {
    if (typeof window === "undefined") return;
    Window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function saveReactionSession(session) {
    const rows = readAll();
    rows.unshift(session);
    writeAll(rows.slice(0,500));
}

export function getReactionSessions(limit=50) {
    const rows = readAll();
    return rows.slice(0, limit);
}

export function getLatestReactionSession() {
    const rows = readAll();
    return rows.length > 0 ? rows[0] : null;
}

