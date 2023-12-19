import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';

@Resolver('category')
export class CategoryResolver {
    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
        private readonly categoryService: CategoryService,
    ) { }

    @Mutation(() => CategoryEntity)
    async create(
        @Args('createCategoryInput') createCategoryDto: CreateCategoryDto
    ) {
        try {
            const existingCategory = await this.categoryService.findByName(
                createCategoryDto.name,
            );
            if (existingCategory) {
                // return res.handler.conflict(MESSAGES.CATEGORY.CATEGORY_EXISTS, null);
                return new GraphQLError(MESSAGES.CATEGORY.CATEGORY_EXISTS, null);
            }
            const newCategory = await this.categoryService.create(createCategoryDto);
            // return res.handler.success(MESSAGES.CATEGORY.CREATE_SUCCESS, newCategory);
            return newCategory;
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [CategoryEntity])
    async FindAllCategory() {
        try {
            const category = await this.categoryService.findAll();
            // return res.handler.success(MESSAGES.CATEGORY.GET_ALL_CATEGORY, Category);
            return category;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => CategoryEntity)
    async findCategory(
        @Args('id') id: number
    ) {
        try {
            const data = await this.categoryService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.CATEGORY.NOT_FOUND, data);
                return new GraphQLError(MESSAGES.CATEGORY.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.CATEGORY.GET_CATEGORY, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => CategoryEntity)
    async updateCategory(
        @Args('id') id: number,
        @Args('updateCategoryInput') updateCategoryDto: UpdateCategoryDto
    ) {
        try {
            const existingCategory = await this.categoryService.read(id);
            if (!existingCategory) {
                // return res.handler.notFound(MESSAGES.CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.CATEGORY.NOT_FOUND, null);
            }
            if (updateCategoryDto.name) {
                const findData = await this.categoryService.findByName(
                    updateCategoryDto.name,
                );
                if (findData) {
                    // return res.handler.conflict(MESSAGES.CATEGORY.CATEGORY_EXISTS, null);
                    return new GraphQLError(MESSAGES.CATEGORY.CATEGORY_EXISTS, null);
                }
            }
            const updatedData = await this.categoryService.update(id, updateCategoryDto);
            // return res.handler.success(MESSAGES.CATEGORY.UPDATE_SUCCESS, updatedData);
            return updatedData;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deleteCategory(
        @Args('id') id: number
    ) {
        try {
            const category = await this.categoryService.read(id);
            if (!category || category.isDelete === true) {
                // return res.handler.notFound(MESSAGES.CATEGORY.NOT_FOUND,null);
                return new GraphQLError(MESSAGES.CATEGORY.NOT_FOUND, null);
            }
            category.isDelete = true;
            await this.categoryRepository.save(category);
            await this.categoryService.destroy(id);
            // return res.handler.success(MESSAGES.CATEGORY.DELETE_CATEGORY, existingCategory);
            return MESSAGES.CATEGORY.DELETE_CATEGORY;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [SubCategoryEntity])
    async getSubCategories(
        @Args('categoryId', { nullable: true }) categoryId: number,
        @Args('minDuration', { type: () => Number, nullable: true }) minDuration: number,
        @Args('maxDuration', { type: () => Number, nullable: true }) maxDuration: number,
        @Args('tags', { nullable: true }) tags: string,
    ) {
        try {
            const options = {
                categoryId: categoryId !== null && categoryId !== undefined ? categoryId : null,
                minDuration: minDuration !== null && minDuration !== undefined ? Number(minDuration) : null,
                maxDuration: maxDuration !== null && maxDuration !== undefined ? Number(maxDuration) : null,
                tags: typeof tags === 'string' && tags !== null && tags !== undefined ? tags : null,
            };

            const subcategories = await this.categoryService.getSubCategories(options);
            if (subcategories.length == 0) {
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND)
            }
            return subcategories;
        } catch (error) {
            throw new Error(error);
        }
    }

    @Query(() => [CategoryEntity])
    async getCategoriesWithSubCategoriesAndSessions() {
        return await this.categoryService.getAllCategoriesWithSubCategoriesAndSessions();
    }
}
