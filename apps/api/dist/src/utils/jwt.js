import jwt from "jsonwebtoken";
export function tokenUret(payload, gizliAnahtar) {
    return jwt.sign(payload, gizliAnahtar, {
        expiresIn: "12h"
    });
}
export function tokenDogrula(token, gizliAnahtar) {
    return jwt.verify(token, gizliAnahtar);
}
//# sourceMappingURL=jwt.js.map