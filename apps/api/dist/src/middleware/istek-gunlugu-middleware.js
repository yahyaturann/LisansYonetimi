import morgan from "morgan";
export const istekGunluguMiddleware = morgan((tokens, req, res) => {
    return [
        "İstek işlendi:",
        tokens.method(req, res),
        tokens.url(req, res),
        "| Durum:",
        tokens.status(req, res),
        "| Süre:",
        `${tokens["response-time"](req, res)} ms`
    ].join(" ");
});
//# sourceMappingURL=istek-gunlugu-middleware.js.map