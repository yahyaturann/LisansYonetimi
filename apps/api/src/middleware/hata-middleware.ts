import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiHatasi extends Error {
  statusKodu: number;

  constructor(mesaj: string, statusKodu = 400) {
    super(mesaj);
    this.name = "ApiHatasi";
    this.statusKodu = statusKodu;
  }
}

export function asyncYakala(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function hataMiddleware(
  hata: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (hata instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: hata.issues[0]?.message ?? "Geçersiz istek verisi."
    });
    return;
  }

  if (hata instanceof ApiHatasi) {
    res.status(hata.statusKodu).json({
      success: false,
      message: hata.message
    });
    return;
  }

  console.error("Beklenmeyen sunucu hatası:", hata);

  res.status(500).json({
    success: false,
    message: "İşlem sırasında beklenmeyen bir hata oluştu."
  });
}
