import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/src/core/prisma/prisma.service';

import { LoginInput } from './inputs/login.input';
import { verify } from 'argon2';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { RedisService } from '@/src/core/redis/redis.service';
import session from 'express-session';
import { TOTP } from 'otpauth';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';

@Injectable()
export class SessionService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService){

    }

   public async findByUser(req: Request) {
//   console.log('req.session:', req.session);
  const userId = req.session.userId;
//   console.log('userId from session:', userId);

  if (!userId) {
    throw new NotFoundException('Користувача не знайдено в сесії');
  }

  const keys = await this.redisService.client.keys('sessions:*');
//   console.log('All session keys:', keys);

  const userSessions: any[] = [];

  for (const key of keys) {
    const sessionDataRaw = await this.redisService.client.get(key);
    if (sessionDataRaw) {
      try {
        const session = JSON.parse(sessionDataRaw);
        // console.log(`Key: ${key}, userId in session: ${session.userId}`);

        if (session.userId === userId) {
          userSessions.push({
            ...session,
            id: key.split(':')[1],
          });
        }
      } catch (err) {
        console.warn(`Неможливо розпарсити сесію для ключа ${key}`, err);
      }
    }
  }

//   console.log('User sessions found:', userSessions.length);

  userSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return userSessions.filter(session => session.id !== req.session.id);
}

    public async findCurrent(req: Request) {
        const sessionId = req.session.id;

        const key = `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`;

        const sessionData = await this.redisService.client.get(key);

        if (!sessionData) {
            throw new NotFoundException('Сесію не знайдено');
        }

        let session: any;
        try {
            session = JSON.parse(sessionData);
        } catch (err) {
            console.warn(`Не вдалося розпарсити сесію: ${key}`, err);
            throw new Error('Помилка при обробці сесії');
        }

        return {
            ...session,
            id: sessionId,
        };
    }

    public async clearSession(req: Request){
        req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))

        return true;
    }

    public async removeSession(req: Request,id: string){
        if(req.session.id === id){
            throw new ConflictException('Поточну сессію видалити не можна')
        }

        await this.redisService.client.del(`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`)

        return true;
    }

    public async login(req: Request,input: LoginInput,userAgent: string){
        const { login, password, pin} = input;

        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    { username: { equals:login }},
                    { email: { equals:login }}
                ]
            }
        })
        
        if(!user)
            throw new NotFoundException('Користувач не знайден')

        const isValidPassword = await verify(user.password,password)

        
        if(!isValidPassword)
            throw new UnauthorizedException('Неправильний пароль пароль')

        const metadata = getSessionMetadata(req,userAgent)
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

        // Зберігаємо сессію
        return saveSession(req,user,metadata) 
    }
    public async logout(req: Request){
        return destroySession(req, this.configService)
    }
}
