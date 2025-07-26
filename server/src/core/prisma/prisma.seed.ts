import { PrismaClient } from "../../../prisma/generated";
import { BadRequestException, Logger } from "@nestjs/common";
import { CATEGORIES } from "./data/categories.data";
import { USERNAMES } from "./data/users.data";
import { STREAMS } from "./data/streams.data";
import { hash } from "argon2";

const prisma = new PrismaClient()

async function main() {
    try {
        Logger.log('Початок заповнення БД')
        await prisma.$transaction([
            prisma.user.deleteMany(),
            prisma.socialLink.deleteMany(),
            prisma.stream.deleteMany(),
            prisma.category.deleteMany()
        ])

        await prisma.category.createMany({
            data: CATEGORIES
        })

        Logger.log('Категорії створені')

        const categories = await prisma.category.findMany()

        const categoriesBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]))

        await prisma.$transaction(async tx => {
            for(const username of USERNAMES){
                const randomCategory = 
                    categoriesBySlug[
                        Object.keys(categoriesBySlug)[
                            Math.floor(
                                Math.random() * 
                                    Object.keys(categoriesBySlug).length
                            )
                        ]
                ]

                const userExists = await tx.user.findUnique({
                    where: {
                        username
                    } 
                })
                if(!userExists){
                    const createdUser = await tx.user.create({
                        data: {
                            email: `${username}@gmail.com`,
                            password: await hash('12345678'),
                            username, 
                            displayName: username,
                            avatar: `/channels/${username}.webp`,
                            socialLinks: {
                                createMany: {
                                    data:[
                                        {
                                            title: "Telegam",
                                            url: `https://t.me/${username}`,
                                            position: 1
                                        },
                                        {
                                            
                                            title: "GitHub",
                                            url: `https://github.com/${username}`,
                                            position: 2
                                        }
                                    ]
                                }
                            },
                        }
                    })
                
                    const randomTitles = STREAMS[randomCategory.slug]
                    const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)]

                    await tx.stream.create({
                        data: {
                            title: randomTitle,
                            thumbnailUrl: `/streams/${createdUser.username}.webp`,
                            user: {
                                connect: {
                                    id: createdUser.id
                                }
                            },
                            category: {
                                connect: {
                                    id: randomCategory.id   
                                }
                            }
                        }
                    })
                    Logger.log(`Користувач "${createdUser.username}" та його стрім успішно створені`)
                }
            }
            
        }, { timeout: 30000})
        Logger.log(`БД успішно заповнено`)

    } catch (error) {
        Logger.error(error)
        throw new BadRequestException('Помилка при заповнені БД')
    } finally {
        Logger.log("Закриття з'єднання з БД")
        await prisma.$disconnect()
        Logger.log("З'єднання з БД успішно закрите")
    }
}
main()