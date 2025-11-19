import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TransactionalEmailDto {
    @ApiProperty({
        example: "email@example.com",
        description: 'Email del destinatario'
    })
    @IsString()
    to: string;

    @ApiProperty({
        example: "Juan",
        description: 'Nombre para el saludo'
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: "Invitación Recibida",
        description: 'Título de la acción (Ej: "Invitación Recibida")'
    })
    @IsString()
    mainTitle: string;

    @ApiProperty({
        example: "Te han invitado a la banda...",
        description: 'Descripción del cuerpo (Ej: "Te han invitado a la banda...")'
    })
    @IsString()
    mainMessage: string;

    @ApiProperty({
        example: "Aceptar Invitación",
        description: 'Texto del botón'
    })
    @IsString()
    buttonText: string;

    @ApiProperty({
        example: "https://front-one-gray.vercel.app/",
        description: '**EL ENLACE ESPECÍFICO DE LA ACCIÓN**'
    })
    @IsString()
    actionUrl: string;

    @ApiProperty({
        example: "Invitacion",
        description: 'Asunto del correo'
    })
    @IsString()
    pageTitle: string;

    @ApiProperty({
        example: "Syncro",
        description: 'Nombre de la aplicacion'
    })
    @IsString()
    appName: string;

    @ApiProperty({
        example: "2025",
        description: 'Año de envio del correo'
    })
    @IsString()
    year: number;

    @ApiProperty({
        example: "Si el botón no funciona, copia y pega el siguiente enlace en tu navegador: https://front-one-gray.vercel.app/",
        description: 'Mensaje secundario del correo'
    })
    @IsString()
    secondaryMessage?: string;
}