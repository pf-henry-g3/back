import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InstrumentRegisterDto } from './instrument-register.dto';

export class AddInstrumentsDto {
    @ApiProperty({
        description: 'Lista de instrumentos y sus niveles para añadir al usuario.',
        isArray: true,
        type: () => InstrumentRegisterDto,
        example: [{ name: 'Guitarra', level: 'Intermediate' }, { name: 'Batería', level: 'Beginner' }]
    })
    @IsArray()
    @ValidateNested({ each: true }) // Valida cada objeto en el array
    @Type(() => InstrumentRegisterDto) // Transforma la data entrante al tipo InstrumentRegisterDto
    newInstruments: InstrumentRegisterDto[];
}