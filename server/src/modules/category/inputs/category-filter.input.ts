import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString } from "class-validator";

@InputType()
export class CategoryFiltersInput{
    @Field(() => Number, { nullable: true })
    @IsNumber()
    @IsOptional()
    take?: number;

    @Field(() => Number, { nullable: true })
    @IsNumber()
    @IsOptional()
    skip?: number;
}