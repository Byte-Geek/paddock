import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateRefereeDto } from './dto/create-referee.dto'
import { CreateParticipationDto } from './dto/create-participation.dto'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('events/:eventId/categories')
    async findAllForEvent(@Param('eventId') eventId: string) {
        return this.categoryService.findAllForEvent(eventId)
    }

    @Roles('ADMIN')
    @Post('events/:eventId/categories')
    async create(
        @Param('eventId') eventId: string,
        @Body() dto: CreateCategoryDto
    ) {
        return this.categoryService.create(eventId, dto)
    }

    @Get('categories/:id')
    async findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id)
    }

    @Roles('ADMIN')
    @Post('categories/:id/referees')
    async addReferee(
        @Param('id') id: string,
        @Body() dto: CreateRefereeDto
    ) {
        return this.categoryService.addReferee(id, dto)
    }

    @Roles('ADMIN')
    @Post('categories/:id/participations')
    async addParticipation(
        @Param('id') id: string,
        @Body() dto: CreateParticipationDto
    ) {
        return this.categoryService.addParticipation(id, dto)
    }
}
