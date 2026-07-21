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
import { CoachService } from './coach.service'
import { CreateCoachDto } from './dto/create-coach.dto'
import { UpdateCoachDto } from './dto/update-coach.dto'

@Controller('coaches')
export class CoachController {
    constructor(private readonly coachService: CoachService) {}

    @Get()
    async findAll() {
        return this.coachService.findAll()
    }

    @Post()
    async create(@Body() dto: CreateCoachDto) {
        return this.coachService.create(dto)
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
        return this.coachService.update(id, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.coachService.remove(id)
    }
}
