import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateSubCategoryDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.NAME, {
        message: VALIDATON_MESSAGES.NAME,
    })
    name: string;

    @Field()
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    category: number;

    @Field()
    @IsNotEmpty()
    @IsString()
    tags: string;

    @Field()
    @IsOptional()
    image: string;
}

@InputType()
export class UpdateSubCategoryDto extends PartialType(
    OmitType(CreateSubCategoryDto, ['category']),
) { }

// @InputType()
// export class GetSubCategoryByDuration {
//     @Field()
//     @IsNotEmpty()
//     // @IsNumber()
//     minDuration: string;

//     @Field()
//     @IsNotEmpty()
//     // @IsNumber()
//     maxDuration: string;

//     @Field()
//     @IsOptional()
//     @IsString()
//     tags?: string;
// }
