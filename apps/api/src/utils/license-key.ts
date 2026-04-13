import { randomBytes } from "node:crypto";

function parcaUret(uzunluk: number) {
  return randomBytes(uzunluk).toString("hex").slice(0, uzunluk).toUpperCase();
}

export function lisansAnahtariUret(prefix: string = "LIS") {
  return `${prefix}-${parcaUret(4)}-${parcaUret(4)}-${parcaUret(4)}`;
}
