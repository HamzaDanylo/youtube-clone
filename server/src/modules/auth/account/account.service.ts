import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service'
import { CreateUserInput } from './inputs/create-user.input';
import { hash, verify } from 'argon2';
import { ChangeeEmailInput } from './inputs/change-email-input';
import { User } from '@/prisma/generated';
import { ChangePasswordInput } from './inputs/change-password-input';

@Injectable()
export class AccountService {
    public constructor(private readonly prismaService: PrismaService){
    }

    public async me(id:string){
        const user = await this.prismaService.user.findUnique({
            where:{
                id: id
            }
        })
        return user;
    }
    public async create(input: CreateUserInput){
        const {email, username, password} = input;
        
        const isUsernameExists = await this.prismaService.user.findUnique({
            where: {
                username
            }
        })
        if(isUsernameExists)
            throw new ConflictException("Це ім'я вже зайняте")
    
        const isEmailExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if(isEmailExists)
            throw new ConflictException("Це пошта вже зайнта")
        const user = await this.prismaService.user.create({
            data: {
                username,
                email,
                password: await hash(password),
                displayName: username
            }
        })
        
        return true;
    }

    public async changeEmail(user: User, input: ChangeeEmailInput){
        const { email } = input;

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                email
            }
        }) 
        return true 
    }
    
    public async changePassword(user: User, input: ChangePasswordInput){
        const { oldPassword, newPassword } = input;

        const isValid = await verify(user.password, oldPassword) 

        if(!isValid){
            throw new UnauthorizedException('Невірний старий пароль')
        }


        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                password: await hash(newPassword)
            }
        }) 
        return true 
    } 
}
