import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserCredentials } from "./user.credentials.entity";
import { UserSessionsEntity } from "src/session/userSession.entity";
import { UserPreferencesEntity } from "src/preference/userPreference.entity";
import { UserAchievementsEntity } from "src/achievement/userAchievement.entity";
import { UserPrivacyPolicyEntity } from "src/privacy-policy/user-privacy-policy.entity";
import { UserNotificationEntity } from "src/notification/userNotification.entity";

@ObjectType()
@Entity('users')
export class UserEntity extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column({ unique: true })
    email: string;

    @Field()
    @Column({ default: null, length: 10000 })
    image?: string;

    @Field()
    @Column({ default: true })
    isPrivacyPolicyAccepted: boolean;

    @Field()
    @Column()
    acceptedPolicyVersion: number;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt: Date;

    @Field(() => UserCredentials)
    @OneToOne(() => UserCredentials, { cascade: true })
    @JoinColumn()
    credential: UserCredentials;

    @Field(() => UserAchievementsEntity)
    @OneToMany(() => UserAchievementsEntity, userAchievement => userAchievement.user)
    userAchievements: UserAchievementsEntity[];

    @Field(() => UserNotificationEntity)
    @OneToMany(() => UserNotificationEntity, userNotification => userNotification.user)
    userNotifications: UserNotificationEntity[];

    @Field(() => UserPrivacyPolicyEntity)
    @OneToMany(() => UserPrivacyPolicyEntity, userPolicy => userPolicy.user)
    userPolicy: UserPrivacyPolicyEntity[];

    @Field(() => UserPreferencesEntity)
    @OneToMany(() => UserPreferencesEntity, userPreferences => userPreferences.user)
    userPreferences: UserPreferencesEntity[];

    @Field(() => UserSessionsEntity)
    @OneToMany(() => UserSessionsEntity, userSessions => userSessions.user)
    userSessions: UserSessionsEntity[];
}