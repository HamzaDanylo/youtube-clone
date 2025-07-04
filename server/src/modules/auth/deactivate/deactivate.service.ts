import { PrismaService } from '@/src/core/prisma/prisma.service';
import {    Injectable, NotFoundException,BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { DeactivateInput } from './inputs/deactivate-user.input';
import { TOTP } from 'otpauth';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service';
import { destroySession } from '@/src/shared/utils/session.util';
import { verify } from 'argon2';

@Injectable()
export class DeactivateService {
    public constructor(private readonly prismaService: PrismaService,private readonly configService: ConfigService){}
    
    public async deactivateAccount(req: Request,input: DeactivateInput){
        const { password, pin } = input
        
        const user = await this.prismaService.user.findUnique({
            where: {
                id: req.session.userId
            }
        })
        if(!user)
            throw new BadRequestException('Не вдалось отримати користувача')
        
        
        const isValidPassword = await verify(user.password, password)
        

        if(!isValidPassword)
            throw new BadRequestException('Невірний пароль')

        if(!user?.isTotpEnabled )
            throw new NotFoundException('Для деактивації вам потрібно активувати 2-фа аутентифікацію')
        else 
            {
            if (user.isTotpEnabled) {
            if (!pin) {
                return {
                    message: 'Потрібно ввести пін'
                }
            }

            if (!user.totpSecret) {
                throw new BadRequestException('TOTP не налаштований для користувача')
            }

            const totp = new TOTP({
                issuer: 'Danya',
                digits: 6,
                label: `${user.email}`,
                algorithm: "SHA1",
                secret: user.totpSecret
            }) 

            const delta = totp.validate({ token: pin }) 

            if (delta === null) {
                throw new BadRequestException('Невірний код')
            }
        }
            await this.prismaService.user.update({
                where: {
                    id: req.session.userId

                },
                data: { 
                    isDeactivated: true,
                    deactivatedAt: new Date() 
                }
            })}
            return destroySession(req, this.configService)
                        
            // return true
    }
}
