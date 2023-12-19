import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { Between, Repository } from 'typeorm';
import {
    CreateSubCategoryDto,
    UpdateSubCategoryDto,
} from './subCategory.dto';
import { SubCategoryEntity } from './subCategory.entity';
import { capitalizeName } from 'src/common/utils/common.utils';
import { SessionEntity } from 'src/session/session.entity';
import { UserSessionsEntity } from 'src/session/userSession.entity';

@Injectable()
export class SubCategoryService {
    constructor(
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
        @InjectRepository(SessionEntity)
        private sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserSessionsEntity)
        private userSessionsRepository: Repository<UserSessionsEntity>,
        private categoryService: CategoryService,
    ) { }

    async create(createSubCategoryDto: CreateSubCategoryDto) {
        createSubCategoryDto.name = capitalizeName(createSubCategoryDto.name);
        const category = await this.categoryService.read(
            createSubCategoryDto.category,
        );
        const addSubCategory = this.subCategoryRepository.create({
            ...createSubCategoryDto,
            category: category,
        });

        await this.subCategoryRepository.save(addSubCategory);
        return addSubCategory;
    }

    async findAll() {
        return await this.subCategoryRepository.find({
            relations: ['category'],
            select: {
                category: {
                    id: true,
                }
            }
        });
    }

    async findByName(name: string) {
        return this.subCategoryRepository.findOne({
            where: {
                name,
            },
        });
    }

    async read(id: number) {
        return await this.subCategoryRepository.findOne({ where: { id: id }, relations: ['category'] });
    }

    async update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
        if (updateSubCategoryDto.name) {
            updateSubCategoryDto.name = capitalizeName(updateSubCategoryDto.name);
        }
        await this.subCategoryRepository.update(id, updateSubCategoryDto);
        const data = await this.read(id);
        return data;
    }

    async destroy(id: number) {
        await this.subCategoryRepository.softDelete({ id: id });
        return { deleted: true };
    }

    // async getSubCategories(options: GetSubCategoryByDuration) {
    //     if (options.tags !== null && options.minDuration !== null && options.maxDuration !== null) {
    //         return this.subCategoryRepository.find({
    //             where: {
    //                 tags: options.tags,
    //                 time: Between(options.minDuration, options.maxDuration),
    //             },
    //             relations: ['sessions']
    //         });
    //     } else if (options.tags !== null) {
    //         return this.subCategoryRepository.find({
    //             where: {
    //                 tags: options.tags,
    //             },
    //             relations: ['sessions']
    //         });
    //     }
    //     else if (options.minDuration !== null && options.maxDuration !== null) {
    //         return this.subCategoryRepository.find({
    //             where: {
    //                 time: Between(options.minDuration, options.maxDuration),
    //             },
    //             relations: ['sessions']
    //         });
    //     }
    // }

    // async sessionList(userId: number, subCategoryId: number) {
    //     const sessions = await this.sessionRepository.find({
    //         where: {
    //             subCategory: { id: subCategoryId },
    //         },
    //         relations: ['userSessions']
    //     });
    //     const sessionWithTime = sessions.map(session => {
    //         const userSession = session.userSessions.find(userSession => userSession.user?.id === userId);
    //         const minTime = userSession ? userSession.minTime : 0;
    //         return {...session, userMinTime: minTime};
    //     });
    //     return sessionWithTime;
    // }

    async sessionList(userId: number, subCategoryId: number) {
        const sessions = await this.sessionRepository.find({
            where: {
                subCategory: { id: subCategoryId },
            },
            relations: ['userSessions'],
        });
        const sessionsWithUserStatus = await Promise.all(
            sessions.map(async (session) => {
                const userSession = await this.userSessionsRepository.findOne({
                    where: {
                        session: { id: session.id },
                        user: { id: userId },
                    },
                });
                return {
                    session,
                    minTime: userSession ? userSession.minTime : 0,
                };
            }),
        );
        const totalMinTime = sessionsWithUserStatus.reduce((totalMinTime, session) => {
            return totalMinTime + session.minTime;
        }, 0);
        return { sessionList: sessionsWithUserStatus, totalMinTime };
    }

    async getGoalList() {
        const goals = await this.subCategoryRepository
            .createQueryBuilder('sub_category')
            .select('DISTINCT sub_category.tags', 'tag')
            .getRawMany();

        const goalsList = goals.map((row) => row.tag);
        return goalsList;
    }
}
