import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicy } from './privacy-policy.entity';
import { CreatePrivacyPolicyDto, UpdatePrivacyPolicyDto } from './privacy-policy.dto';
import { GraphQLError } from 'graphql';
import { MESSAGES } from 'src/common/utils/constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPrivacyPolicyEntity } from './user-privacy-policy.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';

@Resolver()
export class PrivacyPolicyResolver {
    constructor(
        @InjectRepository(UserPrivacyPolicyEntity)
        private userPolicyRepository: Repository<UserPrivacyPolicyEntity>,
        private readonly privacyPolicyService: PrivacyPolicyService,
        private readonly userService: UserService,
    ) { }

    @Mutation(() => PrivacyPolicy)
    async createPolicy(
        @Args('policyInput') createPrivacyPolicyDto: CreatePrivacyPolicyDto
    ) {
        try {
            const existingNotification = await this.privacyPolicyService.findOne(createPrivacyPolicyDto.text);
            if (existingNotification) {
                // return res.handler.conflict(MESSAGES.PRIVACY_POLICY.PRIVACY_POLICY_EXISTS, null);
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.PRIVACY_POLICY_EXISTS, null);
            }
            const newPrivacyPolicy = await this.privacyPolicyService.create(createPrivacyPolicyDto);
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.CREATE_SUCCESS, newPrivacyPolicy);
            return newPrivacyPolicy;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => [PrivacyPolicy])
    async findAllPolicies() {
        try {
            const privacyPolicy = await this.privacyPolicyService.findAll();
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.GET_ALL_PRIVACY_POLICY, PrivacyPolicy);
            return privacyPolicy;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => PrivacyPolicy)
    async findPolicy(
        @Args('policyId') id: number
    ) {
        try {
            const data = await this.privacyPolicyService.read(id);
            if (!data) {
                // return res.handler.notFound(MESSAGES.PRIVACY_POLICY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.NOT_FOUND);
            }
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.GET_PRIVACY_POLICY, data);
            return data;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => PrivacyPolicy)
    async updatePolicy(
        @Args('policyId') id: number,
        @Args('updatePolicyInput') updatePrivacyPolicyDto: UpdatePrivacyPolicyDto
    ) {
        try {
            const policy = await this.privacyPolicyService.read(id);
            if (!policy) {
                // return res.handler.notFound(MESSAGES.PRIVACY_POLICY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.NOT_FOUND, null);
            }
            const findData = await this.privacyPolicyService.findOne(updatePrivacyPolicyDto.text);

            if (findData) {
                // return res.handler.conflict(MESSAGES.PRIVACY_POLICY.PRIVACY_POLICY_EXISTS, null);
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.PRIVACY_POLICY_EXISTS, null);
            }
            const updatedPrivacyPolicy = await this.privacyPolicyService.update(id, updatePrivacyPolicyDto);
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.UPDATE_SUCCESS, updatedPrivacyPolicy);
            return updatedPrivacyPolicy;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    async deletePolicy(
        @Args('policyId') id: number
    ) {
        try {
            const policy = await this.privacyPolicyService.read(id);
            if (!policy) {
                // return res.handler.notFound(MESSAGES.PRIVACY_POLICY.NOT_FOUND, null);
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.NOT_FOUND, null);
            }
            const privacyPolicy = await this.privacyPolicyService.remove(id);
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.DELETE_PRIVACY_POLICY, privacyPolicy);
            return MESSAGES.PRIVACY_POLICY.DELETE_PRIVACY_POLICY;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async userPolicy(
        @Args('policyId') id: number,
        @Context() context: any
    ) {
        try {
            const user = await this.userService.read(context.req.tokenData.id);
            const policy = await this.privacyPolicyService.read(id);
            if (!user || !policy) {
                // return res.handler.notFound(MESSAGES.USER_POLICY_NOT_FOUND, null);
                return new GraphQLError(MESSAGES.USER_POLICY_NOT_FOUND, null);
            }
            const check = await this.userPolicyRepository.find({
                where: {
                    user: { id: user.id },
                    policy: { id: id }
                }
            });
            if (check) {
                return new GraphQLError(MESSAGES.PRIVACY_POLICY.USER_ALREADY_ACCEPTED, null);
            }
            const data = await this.privacyPolicyService.userPolicy(context.req.tokenData.id, id);
            // return res.handler.success(MESSAGES.PRIVACY_POLICY.USER_POLICY_ACCEPT, data.policy.text);
            return MESSAGES.PRIVACY_POLICY.USER_POLICY_ACCEPT;
        } catch (error) {
            // return res.handler.serverError(error, error.message);
            return new GraphQLError(error, null);
        }
    }

    @Query(() => String)
    async getPrivacyPolicy() {
        const htmlContent = fs.readFileSync('./src/privacy-policy/privacy-policy-1.0.html', 'utf8');
        const textOnlyContent = htmlContent
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\r?\n|\r/g, ' ') // Remove line breaks
            .replace(/\s+/g, ' ') // Remove extra spaces
            .trim();
        return textOnlyContent;
    }
}
