import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TOTP } from 'otpauth';
import { EnableTotpInput } from './inputs/enable-totp.input';
import type { User } from '@/prisma/generated';
import { randomBytes } from 'crypto';
import { encode } from 'hi-base32';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
    public constructor(private readonly prismaService: PrismaService){
        
    }
    public async generate(user: User){
        const secret = encode(randomBytes(15)).replace(/=/g,'').substring(0,24)
        const totp = new TOTP({
            issuer: 'Danya',
            digits: 6,
            label: `${user.email}`,
            algorithm: "SHA1",
            secret
        })        
        const otpauthUrl = totp.toString()
        const qrcodeUrl = await QRCode.toDataURL(otpauthUrl)

        return { secret,qrcodeUrl}
    }
    public async enable(user: User, input:EnableTotpInput){
        const {secret, pin} = input;
        const totp = new TOTP({
            issuer: 'Danya',
            digits: 6,
            label: `${user.email}`,
            algorithm: "SHA1",
            secret
        })        

        const delta = totp.validate( { token: pin } ) 
        
        if(delta === null)
            throw new BadRequestException('Невірний код')
        
        await this.prismaService.user.update({
            where:{
                id: user.id
            },
            data: {
                isTotpEnabled: true,
                totpSecret: secret
            }
        })
        return true;
    }

    async disable(user: User){
        await this.prismaService.user.update({
            where:{
                id: user.id
            },
            data: {
                isTotpEnabled: false,
                totpSecret: null
            }
        })
        return true;
    }
    
}
