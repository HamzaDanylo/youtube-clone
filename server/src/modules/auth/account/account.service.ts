import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service'
import { CreateUserInput } from './inputs/create-user.input';
import { hash } from 'argon2';

@Injectable()
export class AccountService {
    public constructor(private readonly prismaService: PrismaService){
    }

    public async findAll(){
        const users = await this.prismaService.user.findMany()
        return users;
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

}
