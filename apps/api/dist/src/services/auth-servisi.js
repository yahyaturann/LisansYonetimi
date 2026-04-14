import bcrypt from "bcryptjs";
import { tokenUret } from "../utils/jwt.js";
export class AuthServisi {
    depo;
    jwtSecret;
    constructor(depo, jwtSecret) {
        this.depo = depo;
        this.jwtSecret = jwtSecret;
    }
    async girisYap(girdi) {
        const kullanici = await this.depo.kullaniciBul(girdi.email);
        if (!kullanici) {
            return {
                success: false,
                message: "E-posta veya şifre hatalı."
            };
        }
        const parolaDogruMu = await bcrypt.compare(girdi.password, kullanici.password);
        if (!parolaDogruMu) {
            return {
                success: false,
                message: "E-posta veya şifre hatalı."
            };
        }
        return {
            success: true,
            message: "Giriş başarılı.",
            token: tokenUret({
                sub: kullanici.id,
                email: kullanici.email
            }, this.jwtSecret)
        };
    }
}
//# sourceMappingURL=auth-servisi.js.map