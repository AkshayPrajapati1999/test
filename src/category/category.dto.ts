import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    isNotEmpty,
} from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateCategoryDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.NAME, {
        message: VALIDATON_MESSAGES.NAME,
    })
    name: string;

    // @Field()
    // @IsOptional()
    // image: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    tags: string;
}

@InputType()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }


@InputType()
export class GetSubCategoryOption {
    @Field()
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @Field()
    @IsNotEmpty()
    minDuration: number;

    @Field()
    @IsNotEmpty()
    maxDuration: number;

    @Field()
    @IsOptional()
    @IsString()
    tags?: string;
}