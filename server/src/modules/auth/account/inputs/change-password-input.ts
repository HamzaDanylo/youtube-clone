import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MinLength,Length } from "class-validator";

@InputType()
export class ChangePasswordInput{
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public oldPassword: string

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    public newPassword: string

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Length(6,6)
    public pin: string
}