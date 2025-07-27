import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SendMessgeInput } from './inputs/message.input';
import { ChangeChatSettingsInput } from './inputs/change-chat-settings.input';
import { User } from '@/prisma/generated';

@Injectable()
export class ChatService {
    public constructor(private readonly prismaService:PrismaService){}

    public async findMessageByStream(streamId: string){
        const messages = await this.prismaService.chatMesssage.findMany({
            where: {
                stream: {
                    id: streamId
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: true
            }
        })
    
        return messages
    }

    public async sendMessage(userId: string, input: SendMessgeInput){
        const { text, streamId } = input;
        
        const stream = await this.prismaService.stream.findUnique({
            where: {
                id: streamId
            }
        })

        if(!stream)
            throw new NotFoundException('Стрім не знайдено')
        if(!stream.isLive)
            throw new BadRequestException('Стрім не в етері')
    
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user)
            throw new NotFoundException('Користувача не знайдено')
    
        
        const message = await this.prismaService.chatMesssage.create({
            data: {
                text,
                user: {
                    connect: {
                        id: userId
                    }
                },
                stream: {
                    connect: {
                        id: streamId
                    }
                }

            }
        })

        return message 
    }

    public async changeChatSettings(input: ChangeChatSettingsInput, user: User) {
        const { isChatEnabled, isChatFollowersOnly, isChatPremiumFollowersOnly } = input
        
        await this.prismaService.stream.update({
            where: {
                userId: user.id
            },
            data: {
                isChatEnabled,
                isChatFollowersOnly,
                isChatPremiumFollowersOnly,
            }
        })
        return true;
    }
}
    

