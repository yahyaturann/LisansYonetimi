import { env } from "./config/env.js";
import { appOlustur } from "./app.js";

const app = appOlustur();

app.listen(env.PORT, () => {
  console.log(`API servisi ${env.PORT} portunda başlatıldı.`);
});
