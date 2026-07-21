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
import { ProtocolTemplateService } from './protocol-template.service'
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto'
import { UpdateProtocolTemplateDto } from './dto/update-protocol-template.dto'

@Controller('protocol-templates')
export class ProtocolTemplateController {
    constructor(
        private readonly protocolTemplateService: ProtocolTemplateService
    ) {}

    @Get()
    async findAll() {
        return this.protocolTemplateService.findAll()
    }

    @Post()
    async create(@Body() dto: CreateProtocolTemplateDto) {
        return this.protocolTemplateService.create(dto)
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateProtocolTemplateDto
    ) {
        return this.protocolTemplateService.update(id, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.protocolTemplateService.remove(id)
    }
}
