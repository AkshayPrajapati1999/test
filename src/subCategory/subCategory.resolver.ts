import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CategoryService } from 'src/category/category.service';
import { SubCategoryService } from './subCategory.service';
import { SubCategoryEntity } from './subCategory.entity';
import { CreateSubCategoryDto, UpdateSubCategoryDto } from './subCategory.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { SessionWithUserMinTime } from './subCategory.model';

@Resolver('subCategory')
export class SubCategoryResolver {
    constructor(
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
        private readonly subCategoryService: SubCategoryService,
        private readonly categoryService: CategoryService,
    ) { }

    @Mutation(() => SubCategoryEntity)
    async createSubCategory(
        @Args('createSubCategoryInput') createSubCategoryDto: CreateSubCategoryDto
    ) {
        try {
            const existingData = await this.subCategoryService.findByName(
                createSubCategoryDto.name,
            );
            if (existingData) {
                // return res.handler.conflict(MESSAGES.SUB_CATEGORY.SUB_CATEGORY_EXISTS, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.SUB_CATEGORY_EXISTS, null);
            }
            const category = await this.categoryService.read(createSubCategoryDto.category);
            if (!category) {
                // return res.handler.notFound(MESSAGES.CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.CATEGORY.NOT_FOUND, null);
            }
            const newSubCategory = await this.subCategoryService.create(createSubCategoryDto);
            // return res.handler.success(MESSAGES.SUB_CATEGORY.CREATE_SUCCESS, newSubCategory);
            return newSubCategory;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [SubCategoryEntity])
    async findAllSubCategories() {
        try {
            const subCategory = await this.subCategoryService.findAll();
            // return res.handler.success(MESSAGES.SUB_CATEGORY.GET_ALL_SUB_CATEGORY, SubCategory);
            return subCategory;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => SubCategoryEntity)
    async findSubCategory(
        @Args('id') id: number
    ) {
        try {
            const data = await this.subCategoryService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.SUB_CATEGORY.GET_SUB_CATEGORY, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => SubCategoryEntity)
    async updateSubCategory(
        @Args('id') id: number,
        @Args('updateSubCategoryInput') updateSubCategoryDto: UpdateSubCategoryDto
    ) {
        try {
            const existingSubCategoryData = await this.subCategoryService.read(id);
            if (!existingSubCategoryData) {
                // return res.handler.notFound(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            }
            if (updateSubCategoryDto.name) {
                const findData = await this.subCategoryService.findByName(
                    updateSubCategoryDto.name,
                );
                if (findData) {
                    // return res.handler.badRequest(MESSAGES.SUB_CATEGORY.SUB_CATEGORY_EXISTS, null);
                    return new GraphQLError(MESSAGES.SUB_CATEGORY.SUB_CATEGORY_EXISTS, null);
                }
            }
            // if (file) {
            //     const client = filestack.init(filestackConfig.apiKey);
            //     const response = await client.upload(file.buffer);
            //     const extensions = ['.jpg', '.jpeg', '.png', '.svg'];
            //     const fileExtension = path.extname(file.originalname).toLowerCase();
            //     if (!extensions.includes(fileExtension)) {
            //         return res.handler.badRequest(MESSAGES.IMAGE_FILE, null);
            //     }
            //     updateSubCategory.image = response.url;
            // } else {
            //     updateSubCategory.image = null;
            // }
            const updatedData = await this.subCategoryService.update(id, updateSubCategoryDto);
            // return res.handler.success(MESSAGES.SUB_CATEGORY.UPDATE_SUCCESS, updatedData);
            return updatedData;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deleteSubCategory(
        @Args('id') id: number
    ) {
        try {
            const existingSubCategoryData = await this.subCategoryService.read(id);
            if (!existingSubCategoryData) {
                // return res.handler.notFound(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            }

            existingSubCategoryData.isDelete = true;
            await this.subCategoryRepository.save(existingSubCategoryData);
            const SubCategory = await this.subCategoryService.destroy(id);
            if (!SubCategory) {
                // return res.handler.notFound(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.SUB_CATEGORY.DELETE_SUB_CATEGORY, SubCategory);
            return MESSAGES.SUB_CATEGORY.DELETE_SUB_CATEGORY;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    // @Query(() => [SubCategoryEntity])
    // async filterSubCategories(
    //     @Args('minDuration', { type: () => String, nullable: true }) minDuration: string,
    //     @Args('maxDuration', { type: () => String, nullable: true }) maxDuration: string,
    //     @Args('tags', { nullable: true }) tags: string
    // ) {
    //     try {
    //         const options = {
    //             minDuration: minDuration ? String(minDuration) : null,
    //             maxDuration: maxDuration ? String(maxDuration) : null,
    //             tags: typeof tags === 'string' ? tags : null,
    //         };
    //         const subcategories = await this.subCategoryService.getSubCategories(options);
    //         if (subcategories.length === 0) {
    //             return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
    //         }
    //         return subcategories;
    //     } catch (error) {
    //         return new GraphQLError(error, null);
    //     }
    // }

    @Query(() => SessionWithUserMinTime)
    @UseGuards(JwtAuthGuard)
    async getSessionList(
        @Args('subCategoryId') id: number,
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const subCategory = await this.subCategoryService.read(id);
            if (!subCategory) return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            const sessions = await this.subCategoryService.sessionList(userId, id);
            if (!sessions) {
                // return res.handler.notFound(MESSAGES.SESSION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SESSION.NOT_FOUND, null);
            };
            // return res.handler.success(MESSAGES.SESSION.GET_SESSION, sessions);
            return sessions;
        }
        catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [String])
    async getGoalList() {
        try {
            const goals = await this.subCategoryService.getGoalList();
            // return res.handler.success(MESSAGES.GOALS_LIST, goals);
            return goals;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }
}
