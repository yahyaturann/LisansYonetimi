import { randomBytes } from "node:crypto";
function parcaUret(uzunluk) {
    return randomBytes(uzunluk).toString("hex").slice(0, uzunluk).toUpperCase();
}
export function lisansAnahtariUret(prefix = "LIS") {
    return `${prefix}-${parcaUret(4)}-${parcaUret(4)}-${parcaUret(4)}`;
}
//# sourceMappingURL=license-key.js.map