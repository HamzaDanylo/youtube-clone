import { ObjectType,Field } from "@nestjs/graphql";

@ObjectType()
export class TotpModel{
    @Field(() => String)
    public qrcodeUrl: string

    @Field(() => String)
    public secret: string
}