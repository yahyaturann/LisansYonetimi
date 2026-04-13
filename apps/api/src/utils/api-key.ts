import { randomBytes } from "node:crypto";

export function apiAnahtariUret() {
  return `api_${randomBytes(24).toString("hex")}`;
}
