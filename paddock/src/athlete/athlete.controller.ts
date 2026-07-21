import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common'
import { AthleteService } from './athlete.service'
import { CreateAthleteDto } from './dto/create-athlete.dto'
import { UpdateAthleteDto } from './dto/update-athlete.dto'

@Controller('athletes')
export class AthleteController {
    constructor(private readonly athleteService: AthleteService) {}

    @Get()
    async findAll() {
        return this.athleteService.findAll()
    }

    @Post()
    async create(@Body() dto: CreateAthleteDto) {
        return this.athleteService.create(dto)
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateAthleteDto) {
        return this.athleteService.update(id, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.athleteService.remove(id)
    }
}
