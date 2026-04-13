import jwt from "jsonwebtoken";

export type AdminTokenIcerigi = {
  sub: string;
  email: string;
};

export function tokenUret(payload: AdminTokenIcerigi, gizliAnahtar: string) {
  return jwt.sign(payload, gizliAnahtar, {
    expiresIn: "12h"
  });
}

export function tokenDogrula(token: string, gizliAnahtar: string) {
  return jwt.verify(token, gizliAnahtar) as AdminTokenIcerigi;
}
