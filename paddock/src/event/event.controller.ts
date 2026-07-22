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
import { EventService } from './event.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpdateEventDto } from './dto/update-event.dto'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) {}

    @Get()
    async findAll() {
        return this.eventService.findAll()
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.eventService.findOne(id)
    }

    @Roles('ADMIN')
    @Post()
    async create(@Body() dto: CreateEventDto) {
        return this.eventService.create(dto)
    }

    @Roles('ADMIN')
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
        return this.eventService.update(id, dto)
    }

    @Roles('ADMIN')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.eventService.remove(id)
    }
}
