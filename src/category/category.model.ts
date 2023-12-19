import { Field, ObjectType } from "@nestjs/graphql";
import { CategoryEntity } from "./category.entity";
import { SubCategoryEntity } from "src/subCategory/subCategory.entity";
import { SessionEntity } from "src/session/session.entity";

@ObjectType()
export class CategoriesWithSubCategoriesAndSessions {
    @Field(() => [CategoryEntity])
    categories: CategoryEntity[];

    @Field(() => [SubCategoryEntity])
    subCategories: SubCategoryEntity[];

    @Field(() => [SessionEntity])
    sessions: SessionEntity[]
}