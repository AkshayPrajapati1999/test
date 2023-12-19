import { Controller, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from 'path';
import { MESSAGES } from "src/common/utils/constants";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SessionEntity } from "./session.entity";
import { SessionService } from "./session.service";
import * as getMP3Duration from 'get-mp3-duration';
import { SubCategoryEntity } from "src/subCategory/subCategory.entity";
import { CategoryEntity } from "src/category/category.entity";
import { fireStorage } from "firebase-admin-config";

@Controller('upload')
export class SessionAudioController {
    constructor (
        @InjectRepository(SessionEntity)
        private sessionRepository: Repository<SessionEntity>,
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
        private sessionService: SessionService
    ) {}
    
    @Post('sessionAudio')
    @UseInterceptors(FileInterceptor('audio'))
    async userImage(
        @Query('sessionId') id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const findSession = await this.sessionRepository.findOne({where: {id: id}});
        // const client = filestack.init(filestackConfig.apiKey);
        // const response = await client.upload(file.buffer);
        const bucket = fireStorage;
        const extensions = ['.jpg', '.jpeg', '.png', '.svg', '.mp3'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!extensions.includes(fileExtension)) return MESSAGES.IMAGE_FILE;
        const sessionFolder = `sessions/${findSession.id}`
        const fileName = `${sessionFolder}session_${findSession.id}_${Date.now()}${fileExtension}`;
        const fileBuffer = file.buffer;
        await bucket.file(fileName).save(fileBuffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });
        async function getDownloadUrl(date: string): Promise<string | null> {
            const file = bucket.file(date);
            const expiration = Date.now() + (20 * 365 * 24 * 60 * 60 * 1000);
            try {
              const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: expiration,
              });
              return signedUrl;
            } catch (error) {
              console.error('Error generating signed URL:', error);
              return null;
            }
          }
        // const downloadURL = `https://storage.googleapis.com/user/${bucket.name}/${fileName}`;
        const downloadURL = await getDownloadUrl(fileName);
        const audioDuration = getMP3Duration(file.buffer);
        var seconds = Math.floor(audioDuration / 1000);
        await this.sessionRepository.update(findSession.id, {audioUrl: downloadURL, totalTime: seconds});
        const readSession = await this.sessionService.read(findSession.id);
        const subCategory = await this.subCategoryRepository.findOne({
            where: {
                id: readSession.subCategory.id
            },
            relations : ['category'],
        });
        const time = subCategory.time += +seconds;
        await this.subCategoryRepository.update(subCategory.id, { time: time });

        const sessionCount = await this.sessionRepository
            .createQueryBuilder('session')
            .where('session.subCategoryId = :subCategoryId', {
                subCategoryId: subCategory.id,
            })
            .getCount();

        const category = await this.categoryRepository.findOne({
            where: {
                id: subCategory.category.id,
            },
        });
        category.sessions = sessionCount;
        await this.categoryRepository.save(category);
        return downloadURL;
    }
}