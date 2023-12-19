import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateNotificationDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(VALIDATION_PATTERNS.NAME, {
    message: VALIDATON_MESSAGES.NAME,
  })
  name: string;
}

@InputType()
export class PushNotificationDto {
  @Field()
  @IsNotEmpty()
  @IsNumber()
  notificationId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field()
  @IsOptional()
  @IsString()
  extraData?: string;
}

@InputType()
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) { }