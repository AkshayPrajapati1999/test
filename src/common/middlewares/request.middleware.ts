import { Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { ICustomExpressResponse } from './response.middleware';
import { IUserTokenData } from 'src/user/user.model';

export interface ICustomExpressRequest extends Request {
    tokenData: IUserTokenData;
}

@Injectable()
export class RequestMiddleware implements NestMiddleware {
    use(
        @Req() req: ICustomExpressRequest,
        @Res() res: ICustomExpressResponse,
        @Next() next: NextFunction,
    ) {
        next();
    }
}