import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StreamService } from './stream.service';
import { StreamModel } from './models/stream.model';
import { FiltersInput } from './inputs/filters.input';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { User } from '@/prisma/generated';

@Resolver('Stream')
export class StreamResolver {
  constructor(private readonly streamService: StreamService) {}

  @Query(() => [StreamModel] , { name: 'findAllStreams'})
  public async findAll(
    @Args('filters') input: FiltersInput
  ){
    return this.streamService.findAll(input);
  }

  @Query(() => [StreamModel] , { name: 'findRandomStreams'})
  public async findRandom(
  ){
    return this.streamService.findRandom();
  }

  @Mutation(() => Boolean, { name: 'changeStreamInfo' })
  public async changeInfo(
    @Args('data') input: ChangeStreamInfoInput,
    @Authorized() user: User
  ){
    return this.streamService.changeInfo(user, input)
  }
}
