import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateCategoryDto, GetSubCategoryOption, UpdateCategoryDto } from './category.dto';
import { CategoryEntity } from './category.entity';
import { capitalizeName } from 'src/common/utils/common.utils';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
    ) { }

    async create(createCategory: CreateCategoryDto) {
        createCategory.name = capitalizeName(createCategory.name);
        const addCategory = this.categoryRepository.create({
            ...createCategory,
        });

        await this.categoryRepository.save(addCategory);
        return addCategory;
    }

    async findAll() {
        return await this.categoryRepository.find();
    }

    async findByName(name: string) {
        return this.categoryRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.categoryRepository.findOne({ where: { id: id } });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        if (updateCategoryDto.name) {
            updateCategoryDto.name = capitalizeName(updateCategoryDto.name);
        }
        await this.categoryRepository.update(id, updateCategoryDto);
        const category = await this.read(id);
        return category;
    }

    async destroy(id: number) {
        return await this.categoryRepository.softDelete({ id: id });
    }

    async getSubCategories(options: GetSubCategoryOption) {
        const { categoryId, minDuration, maxDuration, tags } = options;
        if (categoryId !== null && categoryId !== undefined) {
            const subCategories = await this.subCategoryRepository.find({
                where: {
                    category: { id: categoryId },
                },
            });
            // if (!subCategories) return null;
            return subCategories;
        } else {
            if (tags !== null && minDuration !== null && maxDuration !== null) {
                return this.subCategoryRepository.find({
                    where: {
                        tags: tags,
                        time: Between(minDuration, maxDuration),
                    },
                    relations: ['sessions']
                });
            } else if (tags !== null) {
                return this.subCategoryRepository.find({
                    where: {
                        tags: tags,
                    },
                    relations: ['sessions']
                });
            }
            else if (minDuration !== null && maxDuration !== null) {
                return this.subCategoryRepository.find({
                    where: {
                        time: Between(minDuration, maxDuration),
                    },
                    relations: ['sessions']
                });
            }
        }

    }

    async getAllCategoriesWithSubCategoriesAndSessions() {
        return await this.categoryRepository.find({
            relations: ['subCategories', 'subCategories.sessions']
        });
    }
}
