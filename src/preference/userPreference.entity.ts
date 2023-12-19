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
import { PreferencesEntity } from './preference.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('user_preferences')
export class UserPreferencesEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => UserEntity)
    @ManyToOne(() => UserEntity, (user) => user.userPreferences, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Field(() => PreferencesEntity)
    @ManyToOne(() => PreferencesEntity, (preferences) => preferences.userPreferences, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'preferencesId' })
    preferences: PreferencesEntity;

    @Field()
    @Column({ default: false })
    is_flag: boolean;

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
