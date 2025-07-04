import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TotpService } from './totp.service';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { TotpModel } from './modules/totp.model';
import { type User } from '@/prisma/generated';
import { EnableTotpInput } from './inputs/enable-totp.input';

@Resolver('Totp')
export class TotpResolver {
  constructor(private readonly totpService: TotpService) {
  }
  @Authorization()
  @Query(() => TotpModel, {name: 'generate_TOTP'})
  public generate(
      @Authorized() user: User
  ){
    return this.totpService.generate(user)
  }
  @Authorization()
  @Mutation(() => Boolean, { name: 'enable_totp'})
  public enable(@Authorized() user: User,@Args('data') input: EnableTotpInput){
    return this.totpService.enable(user, input)
  }
  @Authorization()
  @Mutation(() => Boolean, { name: 'disable_totp'})
  public disable(
    @Authorized() user: User
  ){
    return this.totpService.disable(user)
  }
}
