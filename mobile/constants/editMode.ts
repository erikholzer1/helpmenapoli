// ─── DEV-ONLY EDIT MODE ──────────────────────────────────────────────────────
// While true, Top 10 lists show ↑/↓ arrows on every spot so Erik can reorder
// them on his phone, plus a "Copy order" button that puts the new order on the
// clipboard (paste it to Claude, or into constants/discover.ts, to make it
// permanent).
//
// Reorders are saved to AsyncStorage so they survive reloads — but they live
// ONLY on Erik's device. They are NOT the source of truth: constants/discover.ts
// is. Always bake the final order back into that file.
//
// >>> SET THIS TO false BEFORE PUBLISHING TO THE APP STORE. <<<
export const EDIT_MODE = true;
