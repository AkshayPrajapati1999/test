import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from 'src/user/user.entity';
import { ID } from 'type-graphql';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('push_notification_logs')
export class PushNotificationLog {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    title: string;

    @Field()
    @Column({ type: 'longtext' })
    body: string;

    @Field()
    @Column({ type: 'longtext' })
    extraData: string;

    @Field()
    @CreateDateColumn()
    sentAt: Date;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, user => user.id, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
}
