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
import { CategoryService } from './category.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CreateRefereeDto } from './dto/create-referee.dto'
import { CreateParticipationDto } from './dto/create-participation.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('events/:eventId/categories')
    async findAllForEvent(
        @Param('eventId') eventId: string,
        @CurrentUser('role') role: string
    ) {
        return this.categoryService.findAllForEvent(eventId, role)
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
    async findOne(
        @Param('id') id: string,
        @CurrentUser('role') role: string
    ) {
        return this.categoryService.findOne(id, role)
    }

    @Roles('ADMIN')
    @Patch('categories/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto)
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
    @Delete('categories/:id/referees/:refereeId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeReferee(
        @Param('id') id: string,
        @Param('refereeId') refereeId: string
    ) {
        await this.categoryService.removeReferee(id, refereeId)
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
