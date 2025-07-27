import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class SendMessgeInput {
    @Field(() => String)
    @IsNotEmpty()
    @IsString()
    text: string

    @Field(() => String)
    @IsNotEmpty()
    @IsString()
    streamId: string
}