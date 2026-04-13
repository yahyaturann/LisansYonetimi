import rateLimit from "express-rate-limit";

export const genelRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin."
  }
});

export const lisansRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Lisans doğrulama isteği sınırı aşıldı. Lütfen biraz sonra tekrar deneyin."
  }
});
