import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreatePrivacyPolicyDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field()
  @IsNotEmpty()
  @IsNumber()
  version: number;
}

@InputType()
export class UpdatePrivacyPolicyDto extends PartialType(CreatePrivacyPolicyDto) { }

