import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { PreferencesService } from './preference.service';
import { PreferencesEntity } from './preference.entity';
import { CreatePreferenceDto, UpdatePreferenceDto } from './preference.dto';
import { MESSAGES } from 'src/common/utils/constants';
import { GraphQLError } from 'graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { UserPreferencesEntity } from './userPreference.entity';
@Resolver('preferences')
export class PreferenceResolver {
    constructor(
        private readonly preferencesService: PreferencesService,
        private readonly userservice: UserService,
    ) { }

    @Mutation(() => PreferencesEntity)
    async createPreference(
        @Args('createPreferenceInput') createPreferenceDto: CreatePreferenceDto
    ) {
        try {
            const existingPreference = await this.preferencesService.findOne(createPreferenceDto.name);
            if (existingPreference) {
                // return res.handler.conflict(MESSAGES.PREFERENCES.PREFERENCES_EXISTS, null);
                return new GraphQLError(MESSAGES.PREFERENCES.PREFERENCES_EXISTS, null);
            }
            const newPreferences = await this.preferencesService.create(createPreferenceDto);
            // return res.handler.success(MESSAGES.PREFERENCES.CREATE_SUCCESS, newPreferences);
            return newPreferences;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    // @Query(() => [PreferencesEntity])
    // async findAllPReferences(
    //     @Context() context: any,
    // ) {
    //     try {
    //         const preferences = await this.preferencesService.findAll();
    //         // return res.handler.success(MESSAGES.PREFERENCES.GET_ALL_PREFERENCES, Preferences);
    //         return preferences;
    //     } catch (error) {
    //         // return res.handler.serverError(error, error.message);
    //         return new GraphQLError(error, null);
    //     }
    // }

    @Query(() => PreferencesEntity)
    async findPreference(
        @Args('preferenceId') id: number
    ) {
        try {
            const data = await this.preferencesService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.PREFERENCES.NOT_FOUND, data);
                return new GraphQLError(MESSAGES.PREFERENCES.NOT_FOUND, null);
            }
            // return res.handler.success(MESSAGES.PREFERENCES.GET_PREFERENCES, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => PreferencesEntity)
    async updatePreference(
        @Args('preferenceId') id: number,
        @Args('updatePreferenceInput') updatePReferenceDto: UpdatePreferenceDto
    ) {
        try {
            const data = await this.preferencesService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.PREFERENCES.NOT_FOUND, HttpStatus.NOT_FOUND);
                return new GraphQLError(MESSAGES.PREFERENCES.NOT_FOUND, null);
            }
            const findData = await this.preferencesService.findOne(updatePReferenceDto.name);
            if (findData) {
                // return res.handler.conflict(MESSAGES.PREFERENCES.PREFERENCES_EXISTS, null);
                return new GraphQLError(MESSAGES.PREFERENCES.PREFERENCES_EXISTS, null);
            }
            const updatePreference = await this.preferencesService.update(id, updatePReferenceDto);
            // return res.handler.success(MESSAGES.PREFERENCES.UPDATE_SUCCESS, updatePreference);
            return updatePreference
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deletePreference(
        @Args('preferenceId') id: number
    ) {
        try {
            const preferences = await this.preferencesService.read(id);
            if (!preferences) {
                // return res.handler.notFound(MESSAGES.PREFERENCES.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.PREFERENCES.NOT_FOUND, null);
            }
            const data = await this.preferencesService.destroy(id);
            // return res.handler.success(MESSAGES.PREFERENCES.DELETE_PREFERENCES, data);
            return MESSAGES.PREFERENCES.DELETE_PREFERENCES;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async userPreference(
        @Context() context: any,
        @Args('preferenceId') id: number,
        @Args('flag') flag: boolean
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userservice.read(userId);
            const preference = await this.preferencesService.read(id);
            if (!user || !preference) {
                // return res.handler.notFound(MESSAGES.USER_PREFERENCES_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER_PREFERENCES_NOT_FOUND, null);
            }
            const data = await this.preferencesService.userPreferences(userId, id, flag);

            if (!(data && ((data instanceof UpdateResult && data.affected > 0) || (data instanceof UserPreferencesEntity && data?.id)))) {
                // return res.handler.badRequest(MESSAGES.NOT_AFFECTED, null);
                return new GraphQLError(MESSAGES.NOT_AFFECTED, null);
            } else {
                // return res.handler.success(MESSAGES.PREFERENCES.UPDATE_SUCCESS, null);
                return MESSAGES.PREFERENCES.UPDATE_SUCCESS;
            }
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [UserPreferencesEntity])
    @UseGuards(JwtAuthGuard)
    async getUserPreferenceList(
        @Context() context: any
    ) {
        try {
            const userId = context.req.tokenData.id;
            const user = await this.userservice.read(userId);
            if (!user) {
                // return res.handler.notFound(MESSAGES.USER_PREFERENCES_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER_PREFERENCES_NOT_FOUND, null);
            }
            const preferences = await this.preferencesService.getUserPreferences(userId);
            // return res.handler.success(MESSAGES.PREFERENCES.GET_ALL_PREFERENCES, Preferences);
            return preferences;
        } catch (error) {
            return new GraphQLError(error, null);
        }
    }
}
