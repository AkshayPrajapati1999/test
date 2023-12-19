import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users-credentials')
@ObjectType()
export class UserCredentials extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    password: string;

    @Field()
    @Column({ nullable: true })
    passwordResetOtp: string;

    @Field()
    @Column({ nullable: true })
    passwordResetOtpExpires: Date;

    @Field()
    @Column({ nullable: true })
    token: string;

    @Field()
    @Column({ nullable: true })
    deviceToken: string;

    @Field()
    @Column({ nullable: true })
    changePasswwordString: string;

    @Field()
    @Column({ nullable: true })
    otpString: string;

    @Field()
    @CreateDateColumn()
    createdAt!: Date;

    @Field()
    @Column({nullable: true})
    unlockOtp: string;

    // @Field()
    // @Column({nullable: true})
    // unlockOtpString: string;

    @Field()
    @Column({nullable: true})
    unlockOtpExpires: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date;

    @Field()
    @DeleteDateColumn({ nullable: true, default: null })
    deletedAt!: Date;
}