import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { UserModel } from './models/user.model';
import { CreateUserInput } from './inputs/create-user.input';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { User } from '@/prisma/generated';
import { ChangePasswordInput } from './inputs/change-password-input';
import { ChangeeEmailInput } from './inputs/change-email-input';

@Resolver('Account')
export class AccountResolver {
  public constructor(private readonly accountService: AccountService) {}
  
  @Authorization()
  @Query(() => UserModel, { name: 'findProfile'}) 
  public async me(@Authorized('id') id: string){
    return this.accountService.me(id)
  }
  
  @Mutation(() => Boolean, {name: 'CreateUser'})
  public async create(@Args('data') input: CreateUserInput){
    return this.accountService.create(input)
  }
  
  @Authorization()  
  @Mutation(() => Boolean, {name: 'ChangeEmail'})
  public async changeEmail(
    @Authorized() user: User,
    @Args('data') input: ChangeeEmailInput)
    {
      return this.accountService.changeEmail(user,input)
    }
  
  @Authorization()  
  @Mutation(() => Boolean, {name: 'CreatePassword'})
  public async changePassword(
    @Authorized() user: User,
    @Args('data') input: ChangePasswordInput)
    {
      return this.accountService.changePassword(user,input)
    }
}
