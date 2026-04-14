export class LogServisi {
    db;
    constructor(db) {
        this.db = db;
    }
    async yaz(projectId, message) {
        await this.db.log.create({
            data: {
                projectId,
                message
            }
        });
    }
    async listele(projectId, limit = 50) {
        return this.db.log.findMany({
            where: projectId
                ? {
                    projectId
                }
                : undefined,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit
        });
    }
}
//# sourceMappingURL=log-servisi.js.map