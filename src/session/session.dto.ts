import { Field, InputType, PickType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { VALIDATION_PATTERNS, VALIDATON_MESSAGES } from 'src/common/utils/constants';

@InputType()
export class CreateSessionDto {
    @Field()
    @IsNotEmpty()
    @IsString()
    @Matches(VALIDATION_PATTERNS.NAME, {
        message: VALIDATON_MESSAGES.NAME,
    })
    name: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    tags: string;

    @Field()
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    subCategory: number;

    // @Field()
    // @IsOptional()
    // audioUrl?: string;

    // @Field()
    // @IsOptional()
    // totalTime?: number;
}

@InputType()
export class StartSessionDto {
    @Field()
    @IsNotEmpty()
    @IsNumber()
    sessionId: number;

    @Field()
    @IsNotEmpty()
    @IsNumber()
    start: number;
}

@InputType()
export class SessionStopDto {
    @Field()
    @IsNotEmpty()
    @IsNumber()
    sessionId: number;

    @Field()
    @IsNotEmpty()
    @IsNumber()
    minTime: number;
}

@InputType()
export class UpdateSessionDto extends PickType(CreateSessionDto, [
    'name'
    // 'audioUrl'
]) { }
