import { Field, ID, ObjectType } from "@nestjs/graphql";
import { SubCategoryEntity } from "src/subCategory/subCategory.entity";
import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity('category')
export class CategoryEntity extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    name: string;

    @Field()
    @Column({ default: null, length: 10000 })
    image: string;

    @Field()
    @Column()
    tags: string;

    @Field()
    @Column({ default: 0 })
    sessions: number;

    @Field(() => [SubCategoryEntity])
    @OneToMany(() => SubCategoryEntity, (subCategory) => subCategory.category)
    subCategories: SubCategoryEntity[];

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