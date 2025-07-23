import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LivekitService } from '../libs/livekit/livekit.service';

@Injectable()
export class WebhookService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly livekitService: LivekitService
    ){}

    public async receiveWebhookLiveKit(body: string, authorization: string){
        const event = await this.livekitService.receiver.receive(body, authorization, true)
    
        if(event.event === 'ingress_started'){
            if(event.ingressInfo){
                await this.prismaService.stream.update({
                    where: {
                        ingressId: event.ingressInfo.ingressId 
                    },
                    data: {
                        isLive: true
                    }
                })
            }   
        }

        if(event.event === 'ingress_ended'){
            if(event.ingressInfo){
                await this.prismaService.stream.update({
                    where: {
                        ingressId: event.ingressInfo.ingressId 
                    },
                    data: {
                        isLive: false
                    }
                })
            }
        }
    }

}
