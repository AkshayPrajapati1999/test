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
import { SessionEntity } from './session.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('user_sessions')
export class UserSessionsEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, user => user.userSessions, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Field(() => SessionEntity)
    @ManyToOne(() => SessionEntity, (session) => session.userSessions)
    @JoinColumn({ name: 'sessionId' })
    session: SessionEntity;

    @Field()
    @Column({ default: 0 })
    minTime: number;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @DeleteDateColumn()
    deletedAt?: Date;
}