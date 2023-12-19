import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SessionEntity } from './session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from './session.service';
import { SubCategoryService } from 'src/subCategory/subCategory.service';
import { UserService } from 'src/user/user.service';
import { CreateSessionDto, SessionStopDto, UpdateSessionDto } from './session.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserSessionsEntity } from './userSession.entity';
import { LongestSessions, UserMeditationTime, UserMeditationTimeResult } from './session.model';
import { SubCategoryEntity } from 'src/subCategory/subCategory.entity';

@Resolver('session')
export class SessionResolver {
    constructor(
        @InjectRepository(SessionEntity)
        private sessionRepository: Repository<SessionEntity>,
        private readonly sessionService: SessionService,
        private readonly subCategoryService: SubCategoryService,
        private readonly userservice: UserService,
    ) { }

    @Mutation(() => SessionEntity)
    async createSession(
        @Args('createSessionInput') createSessionDto: CreateSessionDto
    ) {
        try {
            const existingSession = await this.sessionService.findByName(
                createSessionDto.name,
            );
            if (existingSession) {
                // return res.handler.conflict(MESSAGES.SESSION.SESSION_EXISTS, null);
                return new GraphQLError(MESSAGES.SESSION.SESSION_EXISTS, null);
            }
            const subCategory = await this.subCategoryService.read(
                createSessionDto.subCategory,
            );
            if (!subCategory || !subCategory.id) {
                // return res.handler.notFound(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SUB_CATEGORY.NOT_FOUND, null);
            }
            const newSession = await this.sessionService.create(createSessionDto);
            // return res.handler.success(MESSAGES.SESSION.CREATE_SUCCESS, newSession);
            return newSession;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [SessionEntity])
    async findAllSessions() {
        try {
            const session = await this.sessionService.findAll();
            // return res.handler.success(MESSAGES.SESSION.GET_ALL_SESSION, Session);
            return session;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => SessionEntity)
    async findSession(
        @Args('sessionId') id: number
    ) {
        try {
            const data = await this.sessionService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.SESSION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SESSION.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.SESSION.GET_SESSION, data)
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => SessionEntity)
    async updateSession(
        @Args('sessionId') id: number,
        @Args('updateSessionInput') updateSessionDto: UpdateSessionDto
    ) {
        try {
            const data = await this.sessionService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.SESSION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SESSION.NOT_FOUND, null);
            }
            if (updateSessionDto.name) {
                const existingSession = await this.sessionService.findByName(
                    updateSessionDto.name,
                );
                if (existingSession) {
                    // return res.handler.conflict(MESSAGES.SESSION.SESSION_EXISTS, null);
                    return new GraphQLError(MESSAGES.SESSION.SESSION_EXISTS, null);
                }
            }
            const updatedSession = await this.sessionService.update(id, updateSessionDto);
            // return res.handler.success(MESSAGES.SESSION.UPDATE_SUCCESS, updatedSession);
            return updatedSession;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deleteSession(
        @Args('sessionId') id: number
    ) {
        try {
            const data = await this.sessionService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.SESSION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SESSION.NOT_FOUND, null);
            }
            data.isDelete = true;
            await this.sessionRepository.save(data);
            const session = await this.sessionService.destroy(id);
            // return res.handler.success(MESSAGES.SESSION.DELETE_SESSION, Session);
            return MESSAGES.SESSION.DELETE_SESSION;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async stopSession(
        @Args('sessionStopInput') sessionStopDto: SessionStopDto,
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userservice.read(userId);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const session = await this.sessionService.read(sessionStopDto.sessionId);
            if (!session) {
                // return res.handler.notFound(MESSAGES.SESSION.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.SESSION.NOT_FOUND, null);
            }
            const updatedSession = await this.sessionService.stopSession(sessionStopDto, userId);
            // return res.handler.success(MESSAGES.SESSION.STOP_SESSION, updatedSession);
            return updatedSession;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => String)
    @UseGuards(JwtAuthGuard)
    async totalSessionTimeOfUser(
        @Context() context: any
    ) {
        try {
            const data = await this.userservice.read(context.req.tokenData.id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const totalTime = await this.sessionService.totalTime(context.req.tokenData.id);
            // return res.handler.success(MESSAGES.USER.USER_SESSION_TIME, totalTime);
            return totalTime;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [LongestSessions])
    @UseGuards(JwtAuthGuard)
    async longestSessionOfUser(
        @Context() context: any
    ) {
        try {
            const data = await this.userservice.read(context.req.tokenData.id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.USER.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.NOT_FOUND, null);
            }
            const longestTime = await this.sessionService.longestSession(context.req.tokenData.id);
            if (!longestTime) {
                // return res.handler.notFound(MESSAGES.USER.USER_LONGEST_SESSION_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER.USER_LONGEST_SESSION_NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.USER.USER_LONGEST_SESSION, longestTime);
            return longestTime;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => UserMeditationTimeResult)
    @UseGuards(JwtAuthGuard)
    async getUserTimeByWeek(
        @Context() context: any
    ) {
        const userId = context.req.tokenData.id;
        const result = await this.sessionService.getUserTimeByWeek(userId);
        return result;
    }
}