import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdatableEntity } from 'src/common/interfaces/update-porfile-picture-entity.interface';
import { FileUploadService } from './file-upload.service';
import { UpdateResultDto } from './dto/update-result.dto'

@Injectable()
export abstract class AbstractFileUploadService<T extends UpdatableEntity> {
    constructor(
        private readonly fileUploadService: FileUploadService,
        private readonly repository: Repository<T>,
    ) { }

    //Metodo para actualizar foto de perfil
    async uploadImage(file: Express.Multer.File, entityId: string): Promise<UpdateResultDto> {
        try {
            //Sube el archivo a cloudinary
            const uploadResponse = await this.fileUploadService.uploadImage(file);
            //Actualiza a la entidad recibida, esto es dinamico T es un dato generico por eso sirve para cualquier entidad
            const updatePayload: Partial<T> = {
                urlImage: uploadResponse.secure_url,
            } as Partial<T>;

            //actualiza en la base de datos en la tabla de la entidad
            await this.repository.update(entityId, updatePayload as any);

            //retorna un DTO indicando el ID actualizado y un mensaje de exito
            return new UpdateResultDto(entityId, `Entidad ${entityId} actualizada con éxito.`);

        } catch (error) {
            console.error('Error al subir la imagen y actualizar la entidad:', error);
            throw error;
        }
    }
}
