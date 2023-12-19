
import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from 'src/user/user.entity';
import { ID } from 'type-graphql';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AchievementsEntity } from './achievement.entity';

@ObjectType()
@Entity('user_achievement')
export class UserAchievementsEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, user => user.userAchievements, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Field(() => AchievementsEntity)
    @ManyToOne(() => AchievementsEntity, (achievement) => achievement.userAchievements, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'achievementId' })
    achivement: AchievementsEntity;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt?: Date;
}