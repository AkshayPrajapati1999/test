import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateAchievementsDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.NAME, {
        message: VALIDATON_MESSAGES.NAME,
    })
    name: string;
}

@InputType()
export class UpdateAchievementsDto extends PartialType(CreateAchievementsDto) { }
