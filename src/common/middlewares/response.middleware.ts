import { Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MESSAGES, STATUS_CODES } from '../utils/constants';
import { ICustomExpressRequest } from './request.middleware';

class ResponseMiddlewareClass {
    req: Request;
    res: Response;
    next: NextFunction;
    constructor(req: Request, res: Response, next: NextFunction) {
        this.req = req;
        this.res = res;
        this.next = next;
        // console.log(`--`, res);

    }

    sender(code: any, message: string, data: object, error: Error | null) {
        // console.log(`fgdfgdffedf345234`);

        if (error) {
            console.log(
                '-----------------------------------------------------------------',
            );
            console.error(this.req.method + ' :: ' + this.req.originalUrl);
            console.error('Headers :: ', JSON.stringify(this.req.headers));
            console.error('Body :: ', JSON.stringify(this.req.body));
            console.error('ERROR :: ', error.message);
            console.log(
                '-----------------------------------------------------------------',
            );
        }

        this.res.status(code).json({
            message,
            data,
            statusCode: code,
        });
    }

    // 2XX SUCCESS
    success(message: string, data: any) {
        this.sender(STATUS_CODES.SUCCESS, message || 'STATUS.SUCCESS', data, null);
    }

    created(message: string, data: any) {
        this.sender(STATUS_CODES.CREATED, message || 'STATUS.CREATED', data, null);
    }

    // 4XX CLIENT ERROR
    badRequest(message: string, data: any) {
        this.sender(
            STATUS_CODES.BAD_REQUEST,
            message || 'STATUS.BAD_REQUEST',
            data,
            null,
        );
    }

    unauthorized(message: string, data: any = null) {
        this.sender(
            STATUS_CODES.UNAUTHORIZED,
            message || 'STATUS.UNAUTHORIZED',
            data,
            null,
        );
    }

    forbidden(message: string, data: any = null) {
        this.sender(
            STATUS_CODES.FORBIDDEN,
            message || 'STATUS.FORBIDDEN',
            data,
            null,
        );
    }

    notFound(message: string, data: any = null) {
        this.sender(
            STATUS_CODES.NOT_FOUND,
            message || 'STATUS.NOT_FOUND',
            data,
            null,
        );
    }

    conflict(message: string, data: any = null) {
        this.sender(
            STATUS_CODES.CONFLICT,
            message || 'STATUS.CONFLICT',
            data,
            null,
        );
    }

    // 5XX SERVER ERROR
    serverError(error: Error, data: any = null) {
        this.sender(STATUS_CODES.SERVER_ERROR, MESSAGES.SERVER_ERROR, data, error);
    }
}

export interface ICustomExpressResponse extends Response {
    handler: ResponseMiddlewareClass;
}

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
    use(
        @Req() req: ICustomExpressRequest,
        @Res() res: ICustomExpressResponse,
        @Next() next: NextFunction,
    ) {
        // console.log(`fdgfdgfdgfdg`);
        res.handler = new ResponseMiddlewareClass(req, res, next);
        // console.log(res.handler);
        next();
    }
}
