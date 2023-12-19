import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { ChangePasswordDto, CreateUserDto, ForgotPasswordDto, OldPasswordDto, ResetPasswordDto, UpdateUserDto, VerifyOtpDto } from './user.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserProfileType } from './user.model';

@Resolver('user')
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Mutation(() => UserEntity)
    async signUp(
        @Args('input') createUserDto: CreateUserDto,
    ) {
        try {
            const newUser = await this.userService.create(createUserDto);
            // return res.handler.success(MESSAGES.USER.CREATE_SUCCESS, newUser);
            return newUser;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async sendReAcitvationEmail(
        @Args('email') email: string
    ) {
        const findEmail = await this.userService.findByEmailWithDelete(email);
        if (findEmail)
            return await this.userService.sendEmailForReActivate(email, findEmail.firstName);

    }

    @Query(() => [UserEntity])
    async findAll() {
        try {
            const users = await this.userService.findAll();
            // return res.handler.success(MESSAGES.USER.GET_ALL_USERS, users);
            return users;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => UserEntity)
    @UseGuards(JwtAuthGuard)
    async userInfo(
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userService.read(userId);
            if (!user) {
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const userData = await this.userService.userInfo(userId);
            // return res.handler.success(MESSAGES.USER.GET_USER, userData);
            return userData;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => UserEntity)
    @UseGuards(JwtAuthGuard)
    async update(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('updateUser') updateUserDto: UpdateUserDto,
        @Context() context: any
    ) {
        try {
            const { id } = context.req.tokenData;
            const existingUserData = await this.userService.read(id);
            const email = await this.userService.findByEmail(updateUserDto.email);
            if (email) return new GraphQLError(MESSAGES.USER.EMAIL_EXISTS, null);
            if (updateUserDto.email && updateUserDto.email !== existingUserData.email) {
                const userEmail = await this.userService.findByEmail(updateUserDto.email);
                if (userEmail) {
                    return new GraphQLError(MESSAGES.USER.EMAIL_EXISTS, null);
                }
                const updatedData = await this.userService.update(id, updateUserDto);
                return updatedData;
            } else {
                const updatedData = await this.userService.update(id, updateUserDto);
                return updatedData;
            }
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async delete(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Context() context: any
    ) {
        try {
            const { id } = context.req.tokenData;
            const user = await this.userService.destroy(id);
            // return res.handler.success(MESSAGES.USER.DELETE_USER, user);
            return MESSAGES.USER.DELETE_USER;

        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async verifyChangePassword(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Context() context: any,
        @Args('verifyChangePasswordInput') oldPasswordDto: OldPasswordDto
    ) {
        try {
            const { id } = context.req.tokenData;
            const existingUser = await this.userService.read(id);
            if (!existingUser) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const hashedPass = await this.userService.comparePasswords(oldPasswordDto.oldPassword, existingUser.credential.password);
            if (!hashedPass) {
                // return res.handler.forbidden(MESSAGES.USER.OLD_PASSWORD_INVALID, null);
                return new GraphQLError(MESSAGES.USER.OLD_PASSWORD_INVALID, null);
            }
            const updateData = await this.userService.verifyChangePassword(id);
            // return res.handler.success(MESSAGES.USER.PASSWORD_CHANGE_STRING, updateData);
            return updateData;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async changePassword(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Context() context: any,
        @Args('changePasswordInput') changePasswordDto: ChangePasswordDto
    ) {
        try {
            const id = context.req.tokenData.id;
            const existingUser = await this.userService.read(id);
            if (!existingUser) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            else if (existingUser.credential.changePasswwordString !== changePasswordDto.changePasswordString) {
                // return res.handler.badRequest(MESSAGES.USER.PASSWORD_CHANGE_STRING_WRONG, null);
                return new GraphQLError(MESSAGES.USER.PASSWORD_CHANGE_STRING_WRONG, null);
            }
            else if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
                // return res.handler.badRequest(MESSAGES.USER.PASSWORD_NOT_MATCH, null);
                return new GraphQLError(MESSAGES.USER.PASSWORD_NOT_MATCH, null);
            }
            const updatePassword = await this.userService.changePassword(id, changePasswordDto);
            // return res.handler.success(MESSAGES.USER.CHANGE_PASSWORD, updatePassword);
            return MESSAGES.USER.CHANGE_PASSWORD;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null)
        }
    }

    @Mutation(() => String)
    async forgotPassword(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('forgotPasswordInput') forgotPassworDto: ForgotPasswordDto,
    ) {
        try {
            const existingUser = await this.userService.findByEmail(forgotPassworDto.email);
            if (!existingUser) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const token = await this.userService.forgotPassword(forgotPassworDto);
            // return res.handler.success(MESSAGES.USER.PASSWORD_TOKEN_SENT, token);
            return token;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async verifyOtp(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('verifyOtpInput') verifyOtpDto: VerifyOtpDto,
    ) {
        try {
            const user = await this.userService.findByEmailWithDelete(verifyOtpDto.email);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            // if (verifyOtpDto.otp !== user.credential.passwordResetOtp || user.credential.passwordResetOtpExpires < new Date()) 
            //     // return res.handler.unauthorized(MESSAGES.USER.INVALID_OTP, HttpStatus.UNAUTHORIZED);
            //     return new GraphQLError(MESSAGES.USER.INVALID_OTP, null);
            //     else if(user.credential.unlockOtp !== verifyOtpDto.otp || user.credential.unlockOtpExpires < new Date()){
            //         return new GraphQLError(MESSAGES.USER.INVALID_OTP, null);
            //     }

            if (user.credential.unlockOtp != null) {
                if (user.credential.unlockOtp !== verifyOtpDto.otp || user.credential.unlockOtpExpires < new Date()) {
                    return new GraphQLError(MESSAGES.USER.INVALID_OTP, null);
                }
                const verify = await this.userService.verifyOtp(verifyOtpDto);
                return verify;
            } else {
                if (verifyOtpDto.otp !== user.credential.passwordResetOtp || user.credential.passwordResetOtpExpires < new Date()) {
                    return new GraphQLError(MESSAGES.USER.INVALID_OTP, null);
                }
                const verify = await this.userService.verifyOtp(verifyOtpDto);
                return verify;
            }

            // const verify = await this.userService.verifyOtp(verifyOtpDto);
            // return verify;
            // return res.handler.success(MESSAGES.USER.VERIFY_OTP, verify);
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async resetPassword(
        // @Req() req: ICustomExpressRequest,
        // @Res() res: ICustomExpressResponse,
        @Args('resetPasswordInput') resetPasswordDto: ResetPasswordDto
    ) {
        try {
            const user = await this.userService.findByEmail(resetPasswordDto.email);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            if (resetPasswordDto.otpString !== user.credential.otpString) {
                // return res.handler.unauthorized(MESSAGES.USER.INVALID_OTP, HttpStatus.UNAUTHORIZED);
                return new GraphQLError(MESSAGES.USER.INVALID_OTP_STRING, null);
            }
            if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
                // return res.handler.badRequest(MESSAGES.USER.PASSWORD_NOT_MATCH, HttpStatus.BAD_REQUEST);
                return new GraphQLError(MESSAGES.USER.PASSWORD_NOT_MATCH, null);
            }
            const password = await this.userService.resetPassword(resetPasswordDto);
            // return res.handler.success(MESSAGES.USER.CHANGE_PASSWORD, password);
            return MESSAGES.USER.CHANGE_PASSWORD;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async checkEmail(
        @Args('email') email: string
    ) {
        try {
            const user = await this.userService.findByEmailWithDelete(email);
            if (!user) {
                return MESSAGES.USER.EMAIL_NOT_FOUND;
            } else if (user.deletedAt === null) {
                return MESSAGES.USER.EMAIL_EXISTS;
            } else if (user.deletedAt !== null) {
                return MESSAGES.USER.REACTIVATE_ACCOUNT;
            }
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }

    @Query(() => String)
    @UseGuards(JwtAuthGuard)
    async getUserTimeByDay(
        @Args('date') getByDate: string,
        @Context() context: any
    ) {
        try {
            const { id } = context.req.tokenData;
            const user = await this.userService.read(id);
            if (!user) return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            const date = new Date(getByDate);
            if (isNaN(date.getTime())) {
                return new GraphQLError(MESSAGES.INVALID_DATE_FORMAT, null);
            }
            const data = await this.userService.userTimePerDay(id, date);
            return data;
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }

    @Query(() => UserProfileType)
    @UseGuards(JwtAuthGuard)
    async getUserProfile(
        @Context() context: any
    ) {
        const userId = context.req.tokenData.id;
        const profile = await this.userService.profilePage(userId);
        return profile; 
    }
}
