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
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('coaches')
export class CoachController {
    constructor(private readonly coachService: CoachService) {}

    @Get()
    async findAll() {
        return this.coachService.findAll()
    }

    @Roles('ADMIN')
    @Post()
    async create(@Body() dto: CreateCoachDto) {
        return this.coachService.create(dto)
    }

    @Roles('ADMIN')
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
        return this.coachService.update(id, dto)
    }

    @Roles('ADMIN')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.coachService.remove(id)
    }
}
