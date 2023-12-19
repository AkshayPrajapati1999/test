import { Controller, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as filestack from 'filestack-js';
import { GraphQLError } from "graphql";
import * as path from 'path';
import { MESSAGES } from "src/common/utils/constants";
import filestackConfig from 'filestack.config';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubCategoryEntity } from "./subCategory.entity";
import { SubCategoryService } from "./subCategory.service";
import { fireStorage } from "firebase-admin-config";

@Controller('upload')
export class SubCategoryImageController {
    constructor (
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
        private subCategoryService: SubCategoryService
    ) {}
    
    @Post('subCategoryImage')
    @UseInterceptors(FileInterceptor('image'))
    async userImage(
        @Query('subCategoryId') id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const findSubCategory = await this.subCategoryRepository.findOne({where: {id: id}});
        // const client = filestack.init(filestackConfig.apiKey);
        // const response = await client.upload(file.buffer);
        const bucket = fireStorage;
        const extensions = ['.jpg', '.jpeg', '.png', '.svg', '.mp3'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!extensions.includes(fileExtension)) {
        return MESSAGES.IMAGE_FILE;
        }
        const subCategoryFolder = `subCategories/${findSubCategory.id}`
        const fileName = `${subCategoryFolder}subCcategory_${findSubCategory.id}_${Date.now()}${fileExtension}`;
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
        await this.subCategoryRepository.update(findSubCategory.id, {image: downloadURL});
        const readUser = await this.subCategoryService.read(findSubCategory.id);
        return readUser.image;
    }
}