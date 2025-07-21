import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class ChangeStreamInfoInput{

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    title: string

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    categoryId?: string
    

}