import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserPrivacyPolicyEntity } from './user-privacy-policy.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';

@ObjectType()
@Entity('privacy_policy')
export class PrivacyPolicy {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({length: 10000})
    text: string;

    @Field()
    @Column({ type: 'varchar' })
    version: number;

    @Field(() => UserPrivacyPolicyEntity)
    @OneToMany(() => UserPrivacyPolicyEntity, userPolicy => userPolicy.user)
    userPolicy: UserPrivacyPolicyEntity[];

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
