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
import { GroupService } from './group.service'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'

@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async findAll() {
        return this.groupService.findAll()
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.groupService.findOne(id)
    }

    @Post()
    async create(@Body() dto: CreateGroupDto) {
        return this.groupService.create(dto)
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
        return this.groupService.update(id, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.groupService.remove(id)
    }
}
