import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IngressService } from './ingress.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { IngressInput } from 'livekit-server-sdk';
import { User } from '@/prisma/generated';

@Resolver('Ingress')
export class IngressResolver {
  public constructor(private readonly ingressService: IngressService) {}

  @Mutation(() => Boolean, { name: "CreateIngress"})
  @Authorization()
  public async create(
    @Authorized() user: User,
    @Args('ingressType') ingressType: IngressInput
  ){
    return this.ingressService.create(user, ingressType)
  }
}
