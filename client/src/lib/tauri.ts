// Helper to detect if running in Tauri
// Used to unconditionally enable "Trust Layer" features on Desktop

export function isTauri(): boolean {
    // @ts-ignore
    return !!window.__TAURI__;
}

export function getTauriVersion(): string {
    // @ts-ignore
    return window.__TAURI__ ? "0.1.0 Beta" : "Web";
}
