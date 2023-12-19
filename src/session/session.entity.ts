import { Field, ObjectType } from '@nestjs/graphql';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';
import { ID } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserSessionsEntity } from './userSession.entity';

@ObjectType()
@Entity('session')
export class SessionEntity extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => SubCategoryEntity)
    @ManyToOne(() => SubCategoryEntity, (subCategory) => subCategory.sessions, { cascade: true, onDelete: 'CASCADE' })
    subCategory: SubCategoryEntity;

    @Field(() => UserSessionsEntity)
    @OneToMany(() => UserSessionsEntity, (userSessions) => userSessions.session)
    userSessions: UserSessionsEntity[];

    @Field()
    @Column()
    name: string;

    @Field()
    @Column({ default: null, length: 10000 })
    audioUrl: string;

    @Field()
    @Column({ default: 0 })
    totalTime: number;

    @Field()
    @Column()
    tags: string;

    @Field()
    @Column({ default: false })
    isDelete: boolean;

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
