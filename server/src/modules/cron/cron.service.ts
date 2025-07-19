import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
constructor(private readonly prismaService: PrismaService){}

    @Cron('*/10 * * * * *')
    public async deleteDeactivatedAccount(){
        const sevenDaysAgo = new Date();
        // sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7)
        // sevenDaysAgo.setSeconds(sevenDaysAgo.getSeconds() - 5)
        // const deactivateAccounts = this.prismaService.user.findMany({
        //     where: {
        //         isDeactivated: true,
        //         deactivatedAt: {
        //             lte: sevenDaysAgo
        //         }
        //     }
        // })
        // for(const user of deactivateAccounts){
        //     console.log(await this.prismaService.use)
        // }
        await this.prismaService.user.deleteMany({
            where: {
                    isDeactivated: true,
                    deactivatedAt: {
                        lte: sevenDaysAgo
                    }
                }    
        })  
    }
}
