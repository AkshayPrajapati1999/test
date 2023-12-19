import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserAchievementsEntity } from './userAchievement.entity';

@ObjectType()
@Entity('achievements')
export class AchievementsEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field(() => UserAchievementsEntity)
    @OneToMany(() => UserAchievementsEntity, userAchievement => userAchievement.user)
    userAchievements: UserAchievementsEntity[];

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @DeleteDateColumn({ default: null, nullable: true })
    deletedAt?: Date;
}
