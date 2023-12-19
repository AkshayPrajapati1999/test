import { Field, ObjectType } from "@nestjs/graphql";
import { AchievementsEntity } from "./achievement.entity";

@ObjectType()
export class achievementDescription {
    @Field(() => AchievementsEntity)
    achievement: AchievementsEntity;

    @Field(() => String)
    description: string;
}