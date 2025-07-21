import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { type FiltersInput } from './inputs/filters.input';
import { Prisma, User } from '@/prisma/generated';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';

@Injectable()
export class StreamService {
    public constructor(private readonly prismaService: PrismaService){

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
