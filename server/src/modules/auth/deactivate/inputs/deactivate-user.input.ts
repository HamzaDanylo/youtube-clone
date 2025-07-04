import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

@InputType()
export class DeactivateInput {
    @Field(() => String)
        @IsString()
        @IsNotEmpty()
        @Length(6,6)
        public pin: string
    @Field(() => String)
        @IsString()
        @IsNotEmpty()
        @MinLength(8)
        public password: string
}