import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AchievementService } from './achievement.service';
import { AchievementsEntity } from './achievement.entity';
import { CreateAchievementsDto, UpdateAchievementsDto } from './achievement.dto';
import { GraphQLError } from 'graphql';
import { MESSAGES } from 'src/common/utils/constants';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAchievementsEntity } from './userAchievement.entity';
import { Repository } from 'typeorm';
import { achievementDescription } from './achievement.model';

@Resolver()
export class AchievementResolver {
    constructor(
        @InjectRepository(UserAchievementsEntity)
        private userAchievementRepository: Repository<UserAchievementsEntity>,
        private readonly achievementsService: AchievementService,
        private readonly userService: UserService,
    ) { }

    @Mutation(() => AchievementsEntity)
    async createAchievement(
        @Args('createAchievemntInput') createAchievementDto: CreateAchievementsDto
    ) {
        try {
            const existingAchievemets = await this.achievementsService.findOne(createAchievementDto.name,);
            if (existingAchievemets) {
                // return res.handler.conflict(MESSAGES.ACHIEVEMENTS.ACHIEVEMENTS_EXISTS, null);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.ACHIEVEMENTS_EXISTS, null);
            }

            const createAchievement = await this.achievementsService.create(createAchievementDto);
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.CREATE_SUCCESS, createAchievement);
            return createAchievement;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [AchievementsEntity])
    async findAllAchievements() {
        try {
            const achievements = await this.achievementsService.findAll();
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.GET_ALL_ACHIEVEMENTS, achievements);
            return achievements;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => AchievementsEntity)
    async findAchievement(
        @Args('achievementId') id: number
    ) {
        try {
            const data = await this.achievementsService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, data);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.GET_ACHIEVEMENTS, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => AchievementsEntity)
    async updateAchievement(
        @Args('achievementId') id: number,
        @Args('updateAchievementInput') updateAchievementDto: UpdateAchievementsDto
    ) {
        try {
            const data = await this.achievementsService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            const findData = await this.achievementsService.findOne(updateAchievementDto.name);
            if (findData) {
                // return res.handler.conflict(MESSAGES.ACHIEVEMENTS.ACHIEVEMENTS_EXISTS, HttpStatus.CONFLICT);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.ACHIEVEMENTS_EXISTS, null);
            }
            const updatedAchievements = await this.achievementsService.update(id, updateAchievementDto);
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.UPDATE_SUCCESS, updatedAchievements);
            return updatedAchievements
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deleteAchievement(
        @Args('achievementId') id: number
    ) {
        try {
            const achievements = await this.achievementsService.read(id);
            if (!achievements) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            const achievement = await this.achievementsService.destroy(id);
            if (!achievement) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, achievement);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.DELETE_ACHIEVEMENTS, achievement);
            return MESSAGES.ACHIEVEMENTS.DELETE_ACHIEVEMENTS;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async userAchievement(
        @Args('achievementId') id: number,
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userService.read(userId);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const achievement = await this.achievementsService.read(id);
            if (!achievement) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            const userAchived = await this.userAchievementRepository.findOne({
                where: {
                    user: { id: userId },
                    achivement: { id: id }
                }
            });
            if (userAchived) {
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.USER_ALREADY_GOT, null);
            }
            const data = await this.achievementsService.userAchievement(userId, id);
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.USER_GOT, data);
            return MESSAGES.ACHIEVEMENTS.USER_GOT;
        }
        catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [AchievementsEntity])
    @UseGuards(JwtAuthGuard)
    async userAchievementList(
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userService.read(userId);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const achievementList = await this.achievementsService.userAchievementList(userId);
            if (!achievementList) {
                // return res.handler.notFound(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.ACHIEVEMENTS.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.ACHIEVEMENTS.GET_ACHIEVEMENTS, achievementList);
            return achievementList;
        }
        catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => achievementDescription)
    @UseGuards(JwtAuthGuard)
    async achievementDescription(
        @Context() context: any,
        @Args('achievementId') achievementId: number
    ) {
        try {
            const userId = context.req.tokenData.id;
            const achievementDescription = await this.achievementsService.achievementDesctiption(userId, achievementId);
            return achievementDescription;
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }
}