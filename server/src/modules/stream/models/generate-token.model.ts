import { Field,ID,ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GenerateTokenModel {
    
    @Field(() => String)
    title: string
} 