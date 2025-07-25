import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryFiltersInput } from './inputs/category-filter.input';

@Injectable()
export class CategoryService {
    public constructor(public readonly prismaService: PrismaService){

    }

    public async findAll(input: CategoryFiltersInput){
        const { take, skip } = input

        const categories = await this.prismaService.category.findMany({
            take: take ?? 12,
            skip: skip ?? 0,
            orderBy: {
                createdAt: 'desc'
            } 
        })

        return categories
    }
    
    public async findBySlug(slug: string){
        const category = this.prismaService.category.findUnique({
            where: {
                slug
            },
            include: {
                streams: {
                    include: {
                        user: true,
                        category: true
                    }
                }
            }
        })
        if(!category)
            throw new NotFoundException('Категорія не знайдена')
    return category
    }
}
