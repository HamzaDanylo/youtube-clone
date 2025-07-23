import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { type FiltersInput } from './inputs/filters.input';
import { Prisma, User } from '@/prisma/generated';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import * as Upload from 'graphql-upload/Upload.js';
import * as sharp from 'sharp'
import { StorageService } from '../libs/storage/storage.service';
import { StreamModel } from './models/stream.model';

@Injectable()
export class StreamService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly storageService: StorageService
    ){}

    public async changeThumbanail(user: User, file: Upload){
        const stream = await this.findByUserId(user)
        
        if(stream.thumbnaliUrl){
            await this.storageService.remove(stream.thumbnaliUrl)
        }
        const chunks: Buffer[] = [];

        for await(const chunk of file.createReadStream()){
            chunks.push(chunk)
        }
        
        const buffer = Buffer.concat(chunks);

        const fileName = `/streams/${user.username}.webp`;

        if(file.filename && file.filename.endWith('.gif')){
            const processedBuffer = await sharp(buffer, { animated: true }).resize(1280, 720).webp().toBuffer()
            await this.storageService.upload(processedBuffer,fileName,'image/webp')
        }else{ 
            const processedBuffer = await sharp(buffer).resize(1280, 720).webp().toBuffer()
            await this.storageService.upload(processedBuffer,fileName,'image/webp')
        }
        
        await this.prismaService.stream.update({
            where: { 
                userId: user.id
            },
            data: {
                thumbnaliUrl: fileName
            }
        })
        return true
    }

    public async removeThumbnail(user: User){
        const stream = await this.findByUserId(user)

        if(!stream.thumbnaliUrl){
            return
        }

        await this.storageService.remove(stream.thumbnaliUrl)
        await this.prismaService.stream.update({
            where: { 
                userId: user.id
            },
            data: {
                thumbnaliUrl: null
            }
        })
        return true
    }


private async findByUserId(user: User){
    const stream = await this.prismaService.stream.findUnique({
        where: {
            userId: user.id
        }
    })
    if(!stream)
        throw new BadRequestException('Стрім не знайдений')
    else
        return stream
    
}    
public async findRandom() {
		const total = await this.prismaService.stream.count({
			where: {
				user: {
					isDeactivated: false
				}
			}
		})

		const randomIndexes = new Set<number>()

		while (randomIndexes.size < 4) {
			const randomIndex = Math.floor(Math.random() * total)

			randomIndexes.add(randomIndex)
		}

		const streams = await this.prismaService.stream.findMany({
			where: {
				user: {
					isDeactivated: false
				}
			},
			include: {
				user: true,
				// category: true
			},
			take: total,
			skip: 0
		})

		return Array.from(randomIndexes).map(index => streams[index])
	}

    public async findAll(input: FiltersInput = {}){
        const { take, skip, searchTerm } = input;
        const whereClause = searchTerm ? this.findBySearchTerm(searchTerm) : undefined

        const streams = this.prismaService.stream.findMany({
            take: take ?? 12,
            skip: skip ?? 0,
            where:{
                user: {
                    isDeactivated: false
                },
                ...whereClause
            },
            
            include: { 
                user: {
                    where: {
                        isDeactivated: false 
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
            
        })
        return streams
    }

    public async changeInfo(user: User, input: ChangeStreamInfoInput){
        const { title, categoryId} = input;
        
        await this.prismaService.stream.update({
            where: {
                userId: user.id
            },
            data: {
                title
            }
        })
        return true
    }

    private findBySearchTerm(searchTerm: string): Prisma.StreamWhereInput{
        return {
            OR: [
                {
                    title: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    },
                    user: {
                        username: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                }
            ]
        }
    }
}
