import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ICustomExpressResponse } from 'src/common/middlewares/response.middleware';
import { MESSAGES } from 'src/common/utils/constants';
import { TokenService } from '../token.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { error } from 'console';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const request = context.switchToHttp().getRequest();
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    const response = ctx.response as ICustomExpressResponse;
    const headers = ctx.req.headers;
    // const response = context.switchToHttp().getResponse() as ICustomExpressResponse;
    // const token = request.headers['authorization']?.split(' ')[1];
    const token = headers.authorization?.split(' ')[1];
    if (token) {
      const user = this.tokenService.decodeToken(token);
      ctx.req.tokenData = user;
      return user ? true : false;
    } else {
      // response.handler.unauthorized(MESSAGES.NOT_AUTHORIZE, null);
      return new error(MESSAGES.NOT_AUTHORIZE, null);
    }
  }
}
