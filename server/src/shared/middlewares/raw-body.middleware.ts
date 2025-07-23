import { BadRequestException, Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import * as getRawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
    public use(req: Request, res: Response, next: NextFunction) {
        if(!req.readable){
            return next(new BadRequestException('Невірні дані у запиті'))
        }        

        getRawBody(req, { encoding: 'utf-8' }).then(rawBody => {
            req.body = rawBody;
            next()
        }).catch(err => {
            throw new BadRequestException('Помилка при отрииманні' , err)

            next(err)
        })

    }
}