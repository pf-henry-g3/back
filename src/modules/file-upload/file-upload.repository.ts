import { Injectable } from "@nestjs/common";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class FileUploadRepository {
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if(error) reject(error);
                    else resolve(result!);
                }
            );

            Readable.from(file.buffer).pipe(upload);
        })
    }
}