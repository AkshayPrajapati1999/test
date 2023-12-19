import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';


@InputType()
export class CreatePreferenceDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.NAME, {
        message: VALIDATON_MESSAGES.NAME,
    })
    name: string;
}

@InputType()
export class UpdatePreferenceDto extends PartialType(CreatePreferenceDto) { }
