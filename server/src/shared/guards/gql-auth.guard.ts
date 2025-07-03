import { PrismaService } from "@/src/core/prisma/prisma.service";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class GqlAuthGuards implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (!request.session?.userId) {
      throw new UnauthorizedException('Користувач не авторизований');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: request.session.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Користувача не знайдено');
    }

    request.user = user;

    return true;
  }
}
