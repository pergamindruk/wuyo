/**
 * Dźwięki panelu /lab, syntezowane w przeglądarce (Web Audio): bez plików i bibliotek.
 * Ciche i krótkie, żeby praca była przyjemna, a nie głośna. Wyłącznik w menu (localStorage).
 */

export type LabSound = 'tick' | 'pop' | 'success' | 'error' | 'nav' | 'notify'

const KEY = 'wuyo-lab-sound'
let ctx: AudioContext | null = null
let lastAt = 0

export function soundEnabled(): boolean {
    try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}

export function setSoundEnabled(on: boolean) {
    try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* tryb prywatny: dźwięk zostaje włączony */ }
    window.dispatchEvent(new CustomEvent('wuyo-lab-sound', { detail: on }))
}

function audio(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
}

/** Jeden ton: częstotliwość, start (s), długość (s), głośność, kształt fali, opcjonalny poślizg w górę/dół. */
function tone(a: AudioContext, freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'sine', glideTo?: number) {
    const osc = a.createOscillator()
    const gain = a.createGain()
    const t = a.currentTime + start
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(a.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
}

export function playSound(kind: LabSound) {
    if (!soundEnabled()) return
    // Bez nakładania się serii kliknięć (np. podwójne zdarzenie).
    const now = performance.now()
    if (kind === 'tick' && now - lastAt < 40) return
    lastAt = now
    const a = audio()
    if (!a) return
    switch (kind) {
        case 'tick': // miękkie kliknięcie, jak dobry przełącznik
            tone(a, 1900, 0, 0.035, 0.035, 'triangle', 1200)
            break
        case 'pop': // otwarcie panelu, wybór opcji
            tone(a, 520, 0, 0.09, 0.05, 'sine', 880)
            break
        case 'nav': // zmiana strony: krótki „szum” w górę
            tone(a, 300, 0, 0.12, 0.025, 'sine', 620)
            break
        case 'success': // dwie nuty w górę (kwinta), zapisane / wysłane
            tone(a, 784, 0, 0.12, 0.05, 'sine')
            tone(a, 1175, 0.08, 0.22, 0.045, 'sine')
            break
        case 'notify': // trzy delikatne nuty, coś nowego
            tone(a, 988, 0, 0.1, 0.035, 'sine')
            tone(a, 1319, 0.09, 0.1, 0.035, 'sine')
            tone(a, 1568, 0.18, 0.18, 0.03, 'sine')
            break
        case 'error': // niski, krótki, bez stresu
            tone(a, 220, 0, 0.16, 0.05, 'triangle', 160)
            break
    }
}
