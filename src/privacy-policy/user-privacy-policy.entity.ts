import { UserEntity } from 'src/user/user.entity';
import {
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { PrivacyPolicy } from './privacy-policy.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { ID } from 'type-graphql';

@ObjectType()
@Entity('user_privacy_policy')
export class UserPrivacyPolicyEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, user => user.userPolicy, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Field(() => PrivacyPolicy)
    @ManyToOne(() => PrivacyPolicy, (policy) => policy.userPolicy, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policyId' })
    policy: PrivacyPolicy;

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