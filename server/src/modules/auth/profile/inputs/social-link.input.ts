import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class SocialLinkInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public title: string

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public url: string
    
}