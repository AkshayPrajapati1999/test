import { Field, ObjectType } from "@nestjs/graphql";
import { UserEntity } from "./user.entity";
import { AchievementsEntity } from "src/achievement/achievement.entity";
import { LongestSessions } from "src/session/session.model";

export interface IUserTokenData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

@ObjectType()
export class UserProfileType {
    @Field(() => UserEntity, {nullable: true})
    user?: UserEntity;

    @Field(() => Number)
    totalMeditationTime: number;

    @Field(() => LongestSessions)
    longestSession: LongestSessions;

    @Field(() => [AchievementsEntity], {nullable: true})
    achievement: [AchievementsEntity];
}