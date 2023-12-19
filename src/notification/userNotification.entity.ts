import { UserEntity } from 'src/user/user.entity';
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
import { NotificationEntity } from './notification.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';

@ObjectType()
@Entity('user_notification')
export class UserNotificationEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.userNotifications, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Field(() => NotificationEntity)
    @ManyToOne(() => NotificationEntity, (notification) => notification.userNotifications, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'notificationId' })
    notification: NotificationEntity;

    @Field()
    @Column({ default: false })
    is_sub_flag: boolean;

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
