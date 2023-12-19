import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserPreferencesEntity } from './userPreference.entity';
// import { UserPreferencesEntity } from './user-preferences.entity';

@ObjectType()
@Entity('preferences')
export class PreferencesEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field(() => UserPreferencesEntity)
    @OneToMany(() => UserPreferencesEntity, userPreferences => userPreferences.preferences)
    userPreferences: UserPreferencesEntity[];

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
