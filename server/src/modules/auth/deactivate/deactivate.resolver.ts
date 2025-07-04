import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { DeactivateService } from './deactivate.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { GqlContext } from '@/src/shared/types/gql-context.types';
import { DeactivateInput } from './inputs/deactivate-user.input';

@Resolver('Deactivate')
export class DeactivateResolver {
  public constructor(private readonly deactivateService: DeactivateService) {}
  @Mutation(() => Boolean, { name: 'deactivate_account'})
  @Authorization()
  public async deactivateAccount(
    @Context() {req}: GqlContext,
    @Args('data') input: DeactivateInput
  ){
    return this.deactivateService.deactivateAccount(req,input)
  }

}
