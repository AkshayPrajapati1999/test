import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import {
    CreatePrivacyPolicyDto,
    UpdatePrivacyPolicyDto,
} from './privacy-policy.dto';
import { PrivacyPolicy } from './privacy-policy.entity';
import { UserPrivacyPolicyEntity } from './user-privacy-policy.entity';

@Injectable()
export class PrivacyPolicyService {
    constructor(
        @InjectRepository(PrivacyPolicy)
        private privacyPolicyRepository: Repository<PrivacyPolicy>,
        @InjectRepository(UserPrivacyPolicyEntity)
        private userPrivacyPolicyRepository: Repository<UserPrivacyPolicyEntity>,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    ) { }

    async create(createPrivacyPolicyDto: CreatePrivacyPolicyDto) {
        const data = this.privacyPolicyRepository.create({
            ...createPrivacyPolicyDto,
        });

        await this.privacyPolicyRepository.save(data);
        return data;
    }

    async findAll() {
        return await this.privacyPolicyRepository.find();
    }

    async findOne(text: string) {
        return this.privacyPolicyRepository.findOne({
            where: {
                text,
            },
        });
    }

    async read(id: number) {
        return await this.privacyPolicyRepository.findOne({ where: { id: id } });
    }

    async findLatestVersion() {
        const latestVersion = await this.privacyPolicyRepository.createQueryBuilder('privacy_policy')
            .orderBy('version', 'DESC')
            .getOne();
        return latestVersion;
    }

    async update(id: number, updatePrivacyPolicyDto: UpdatePrivacyPolicyDto) {
        await this.privacyPolicyRepository.update(id, updatePrivacyPolicyDto);
        return this.read(id);
    }

    async remove(id: number) {
        await this.privacyPolicyRepository.softDelete({ id: id });
        return { deleted: true };
    }

    async userPolicy(userId: number, policyId: number) {
        const user = await this.userService.read(userId);
        const policy = await this.read(policyId);
        const userPolicy = new UserPrivacyPolicyEntity();
        userPolicy.user = user;
        userPolicy.policy = policy;
        await this.userPrivacyPolicyRepository.save(userPolicy);
        return userPolicy;
    }
}
