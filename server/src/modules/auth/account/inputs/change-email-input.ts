import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class ChangeeEmailInput{
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public email: string

}