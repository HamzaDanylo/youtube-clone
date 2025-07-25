import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { StreamService } from './stream.service';
import { StreamModel } from './models/stream.model';
import { FiltersInput } from './inputs/filters.input';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import * as Upload from 'graphql-upload/Upload.js';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { User } from '@/prisma/generated';
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { GenerateTokenModel } from './models/generate-token.model';
import { GenerateStreamInput } from './inputs/generate-stream-token.input';

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

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeStreamInfo' })
  public async changeInfo(
    @Args('data') input: ChangeStreamInfoInput,
    @Authorized() user: User
  ){
    return this.streamService.changeInfo(user, input)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'ChangeStreamThumbnail' })
  public async changeThumbnail(
    @Authorized() user: User,
    @Args('thumbanail', { type: () => GraphQLUpload }, FileValidationPipe) thumbnail: Upload   
  ){
    return this.streamService.changeThumbanail(user, thumbnail)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'RemoveStreamThumbnail' })
  public async removeThumbnail(
    @Authorized() user: User,   
  ){
    return this.streamService.removeThumbnail(user)
  }

  @Authorization()
  @Mutation(() => GenerateTokenModel, { name: 'GenerateStreamToken' })
  public async generateToken(
    @Args('data') input: GenerateStreamInput
  ){
    return this.streamService.generateToken(input)
  }
}
