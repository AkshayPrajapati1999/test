import { Field, ObjectType } from "@nestjs/graphql";
import { SessionEntity } from "./session.entity";
import { SubCategoryEntity } from "src/subCategory/subCategory.entity";
import { SessionWithUserMinTime } from "src/subCategory/subCategory.model";

@ObjectType()
export class  UserMeditationTime {
    @Field(() => String)
    date: string;

    @Field(() => String)
    day: string;

    @Field(() => Number)
    totalMeditationTime: number
}

@ObjectType()
export class UserMeditationTimeResult {
    @Field(() => [UserMeditationTime])
    result: UserMeditationTime[];

    @Field(() => Number)
    totalMeditationTimeWeek: number;

    @Field(() => Number)
    userOverallTime: number;

    @Field(() => String)
    startDate: string;

    @Field(() => String)
    endDate: string;
}

@ObjectType()
export class LongestSessions {
  @Field(() => [SessionWithUserMinTime])
  sessions: SessionWithUserMinTime[] = [];

  @Field(() => Number)
  totalMinTime: number;

  @Field(() => SubCategoryEntity)
  subCategory: SubCategoryEntity;

  @Field(() => String)
  description: string;
}