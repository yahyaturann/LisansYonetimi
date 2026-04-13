import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OTURUM_CEREZI_ADI } from "../lib/ayarlar";

export default async function AnaSayfa() {
  const token = (await cookies()).get(OTURUM_CEREZI_ADI)?.value;

  redirect(token ? "/panel" : "/giris");
}
