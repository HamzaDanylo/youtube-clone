import { applyDecorators, UseGuards } from "@nestjs/common";

import { GqlAuthGuards } from "../guards/gql-auth.guard";

export function Authorization(){
    return applyDecorators(UseGuards(GqlAuthGuards))
}