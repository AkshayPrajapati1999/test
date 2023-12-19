import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CategoryEntity } from 'src/category/category.entity';
import { SessionEntity } from 'src/session/session.entity';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('sub_category')
export class SubCategoryEntity extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column()
    tags: string;

    @Field()
    @Column({ default: 0 })
    time: number;

    @Field()
    @Column({ default: null, length: 10000 })
    image: string;

    @Field()
    @Column({ default: false })
    isDelete: boolean;

    @Field(() => [SessionEntity])
    @OneToMany(() => SessionEntity, (session) => session.subCategory)
    sessions: SessionEntity[];

    @Field(() => CategoryEntity)
    @ManyToOne(() => CategoryEntity, (category) => category.subCategories, { cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: CategoryEntity;

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
