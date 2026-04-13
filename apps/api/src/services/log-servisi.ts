import type { PrismaClient } from "@prisma/client";

export class LogServisi {
  constructor(private readonly db: PrismaClient) {}

  async yaz(projectId: string, message: string) {
    await this.db.log.create({
      data: {
        projectId,
        message
      }
    });
  }

  async listele(projectId?: string, limit = 50) {
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
