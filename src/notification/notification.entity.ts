import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserNotificationEntity } from './userNotification.entity';

@ObjectType()
@Entity('notifications')
export class NotificationEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field(() => UserNotificationEntity)
    @OneToMany(() => UserNotificationEntity, userNotification => userNotification.user)
    userNotifications: UserNotificationEntity[];

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
