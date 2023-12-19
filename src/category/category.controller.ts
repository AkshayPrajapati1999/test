import { Controller, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as path from 'path';
import { MESSAGES } from "src/common/utils/constants";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "./category.entity";
import { CategoryService } from "./category.service";
import { fireStorage } from "firebase-admin-config";

@Controller('upload')
export class CategoryImageController {
    constructor (
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
        private categoryService: CategoryService
    ) {}
    
    @Post('categoryImage')
    @UseInterceptors(FileInterceptor('image'))
    async userImage(
        @Query('categoryId') id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const findCategory = await this.categoryRepository.findOne({where: {id: id}});
        // const client = filestack.init(filestackConfig.apiKey);
        // const response = await client.upload(file.buffer);
        const bucket = fireStorage;
        const extensions = ['.jpg', '.jpeg', '.png', '.svg', '.mp3'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!extensions.includes(fileExtension)) {
        return MESSAGES.IMAGE_FILE;
        }
        const categoryFolder = `categories/${findCategory.id}`
        const fileName = `${categoryFolder}category_${findCategory.id}_${Date.now()}${fileExtension}`;
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
        await this.categoryRepository.update(findCategory.id, {image: downloadURL});
        const readCategory = await this.categoryService.read(findCategory.id);
        return readCategory.image;
    }
}