import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { PubSub } from 'graphql-subscriptions';
import { ChatMessageModel } from './models/chat-message-model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input';
import { User } from '@/prisma/generated';
import { SendMessgeInput } from './inputs/message.input';

@Resolver('Chat')
export class ChatResolver {
  private readonly pubSub: PubSub
  
  public constructor(private readonly chatService: ChatService) {
    this.pubSub = new PubSub()
  }

  @Query(() => [ChatMessageModel], { name: "findChatMessageByStream" })
  public async findMessageByStream(@Args('streamId') streamId: string){
    return this.chatService.findMessageByStream(streamId)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'changeChatSettings' })
  public async changeSettings(
    @Authorized() user: User,
    @Args('data') input: ChangeChatSettingsInput
  ){
    return this.chatService.changeChatSettings(input, user)
  }

  @Authorization()
  @Mutation(() => ChatMessageModel, { name: 'sendMessage' })
  public async sendMessage(
    @Authorized('id') userId: string,
    @Args('data') input: SendMessgeInput
  ){
    const message = await this.chatService.sendMessage(userId, input)
  
    this.pubSub.publish('CHAT_MESSAGE_ADDED', { chatMessageAdded: message })

    return message
  }


  @Subscription(
    () => ChatMessageModel, 
    { name: 'chatMessageAdded', 
      filter(payload, variables) {
      return payload.chatMessageAdded.streamId === variables.streamId
  }})
  public chatMessageAdded(@Args('streamId') streamId: string){
    return this.pubSub.asyncIterableIterator('CHAT_MESSAGE_ADDED')
  }

}
