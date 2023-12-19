import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class LoginDto {
  @Field()
  @Matches(VALIDATION_PATTERNS.EMAIL, { message: VALIDATON_MESSAGES.EMAIL })
  @IsNotEmpty()
  @IsString()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(VALIDATION_PATTERNS.PASSWORD, {
    message: VALIDATON_MESSAGES.PASSWORD_INVALID,
  })
  password: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;
}

@InputType()
export class ValidateTokenDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  token: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;
}
