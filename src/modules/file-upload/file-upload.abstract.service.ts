import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdatableEntity } from 'src/interfaces/update-porfile-picture-entity.interface';
import { FileUploadService } from './file-upload.service';
import { UpdateResultDto } from './dto/update-result.dto'

@Injectable()
export abstract class AbstractFileUploadService<T extends UpdatableEntity> {
    constructor (
        private readonly fileUploadService: FileUploadService,
        private readonly repository: Repository<T>,
    ) {}

    async uploadImage(file: Express.Multer.File, entityId: string): Promise<UpdateResultDto> {
        try {     
            const uploadResponse = await this.fileUploadService.uploadImage(file);
            const updatePayload: Partial<T> = {
                urlImage: uploadResponse.secure_url,
            } as Partial<T>;
    
            await this.repository.update(entityId, updatePayload as any);
    
            return new UpdateResultDto (entityId, `Entidad ${entityId} actualizada con éxito.`);

        } catch (error) {
            console.error('Error al subir la imagen y actualizar la entidad:', error);
            throw error;
        }
    }
}
