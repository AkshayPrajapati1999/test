import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateUserDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.FIRSTNAME, {
        message: VALIDATON_MESSAGES.FIRSTNAME,
    })
    firstName: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.LASTNAME, {
        message: VALIDATON_MESSAGES.LASTNAME,
    })
    lastName: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.EMAIL, { message: VALIDATON_MESSAGES.EMAIL })
    email: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.PASSWORD, {
        message: VALIDATON_MESSAGES.PASSWORD,
    })
    password: string;

    // @Field(() => GraphQLUpload, {nullable: true})
    // @IsOptional()
    // image?: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    deviceToken: string;
}

@InputType()
export class FindUserEmailDto extends PartialType(OmitType(CreateUserDto, ['deviceToken', 'firstName', 'lastName', 'password'])) { }

@InputType()
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'deviceToken'])) { }

@InputType()
export class OldPasswordDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.PASSWORD, {
        message: VALIDATON_MESSAGES.PASSWORD_INVALID,
    })
    oldPassword: string;
}

@InputType()
export class ChangePasswordDto {
    @Field()
    @IsNotEmpty()
    changePasswordString: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.PASSWORD, {
        message: VALIDATON_MESSAGES.PASSWORD_INVALID,
    })
    newPassword: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}

@InputType()
export class ForgotPasswordDto {
    @Field()
    @IsNotEmpty()
    @Matches(VALIDATION_PATTERNS.EMAIL, { message: VALIDATON_MESSAGES.EMAIL })
    email?: string;
}

@InputType()
export class VerifyOtpDto {
    @Field()
    @IsNotEmpty()
    @Matches(VALIDATION_PATTERNS.EMAIL, { message: VALIDATON_MESSAGES.EMAIL })
    email?: string;

    @Field()
    @IsNotEmpty()
    otp: string;
}

@InputType()
export class ResetPasswordDto {
    @Field()
    @IsNotEmpty()
    @Matches(VALIDATION_PATTERNS.EMAIL, { message: VALIDATON_MESSAGES.EMAIL })
    email?: string;

    @Field()
    @IsNotEmpty()
    otpString: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.PASSWORD, {
        message: VALIDATON_MESSAGES.PASSWORD,
    })
    newPassword: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}