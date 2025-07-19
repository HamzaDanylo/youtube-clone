import { Field, InputType } from "@nestjs/graphql";
import {     
    IsNotEmpty, 
    IsString, 
    MaxLength,
    Matches,
    IsOptional
} from "class-validator";


@InputType()
export class ChangeProfileInput{
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)
    public username: string
    
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    public displayName: string
    
    @Field(() => String)
    @IsString()
    @IsOptional()
    @MaxLength(350)
    public bio?: string
}

