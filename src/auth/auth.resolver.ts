import { forwardRef, Inject, Req, Res } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCredentials } from 'src/user/user.credentials.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ICustomExpressRequest } from 'src/common/middlewares/request.middleware';
import { ICustomExpressResponse } from 'src/common/middlewares/response.middleware';
import { LoginDto, ValidateTokenDto } from './auth.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { GraphInspector } from '@nestjs/core';
import { GraphQLError } from 'graphql';

@Resolver('auth')
export class AuthResolver {
    constructor(
        @InjectRepository(UserCredentials)
        private usersCredentials: Repository<UserCredentials>,
        private userService: UserService,
        private readonly authService: AuthService,
        private readonly tokenService: TokenService,
    ) { }

    @Mutation(() => String)
    async logIn(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('logInInput') logInDto: LoginDto
    ) {
        try {
            const user = await this.userService.findByEmail(logInDto.email);
            if (!user) {
                // return res.handler.notFound(MESSAGES.AUTH.INVALID_EMAIL, null);
                return new GraphQLError(MESSAGES.AUTH.INVALID_EMAIL, null);
            }
            const isPasswordValid = await this.userService.comparePasswords(logInDto.password, user.credential.password);
            if (!isPasswordValid) {
                // return res.handler.conflict(MESSAGES.AUTH.INVALID_PASSWORD, null)
                return new GraphQLError(MESSAGES.AUTH.INVALID_PASSWORD, null);
            }
            // const latestPolicy = await this.policyService.findLatestVersion();
            // const latestVersion = latestPolicy.version;
            // if (user.acceptedPolicyVersion !== latestVersion) {
            // return res.handler.conflict(MESSAGES.UPDATE_APP, null);
            // }
            const result = await this.tokenService.login(logInDto);
            // return res.handler.success(MESSAGES.AUTH.LOGIN_SUCCESS, result);
            return result;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async validateToken(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('validateTokenInput') validateTokenDto: ValidateTokenDto
    ) {
        try {
            const decodeJwt = this.tokenService.decodeToken(validateTokenDto.token);
            if (!decodeJwt) {
                // return res.handler.unauthorized(MESSAGES.INVALID_TOKEN, null);
                return new GraphQLError(MESSAGES.INVALID_TOKEN, null);
            }
            if (decodeJwt.id) {
                this.userService.getUser(decodeJwt.id);
                await this.usersCredentials.update(decodeJwt.id, {
                    deviceToken: validateTokenDto.deviceToken,
                });
            }
            const result = await this.authService.validateToken(validateTokenDto);
            // return res.handler.success(MESSAGES.AUTH.LOGIN_SUCCESS, result);
            return MESSAGES.AUTH.LOGIN_SUCCESS;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }
}
