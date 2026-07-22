import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { randomUUID } from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { ProtocolTemplateService } from './protocol-template.service'
import { CreateProtocolTemplateDto } from './dto/create-protocol-template.dto'
import { UpdateProtocolFullDto } from './dto/update-protocol-full.dto'
import { Public } from '../auth/decorators/public.decorator'
import { Roles } from '../auth/decorators/roles.decorator'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'protocols')
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
}

@Controller('protocol-templates')
export class ProtocolTemplateController {
    constructor(
        private readonly protocolTemplateService: ProtocolTemplateService
    ) {}

    @Public()
    @Get()
    async findAll() {
        return this.protocolTemplateService.findAll()
    }

    @Public()
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.protocolTemplateService.findOne(id)
    }

    @Roles('ADMIN')
    @Post()
    async create(@Body() dto: CreateProtocolTemplateDto) {
        return this.protocolTemplateService.create(dto)
    }

    @Roles('ADMIN')
    @Patch(':id/full')
    async updateFull(
        @Param('id') id: string,
        @Body() dto: UpdateProtocolFullDto
    ) {
        return this.protocolTemplateService.updateFull(id, dto)
    }

    @Roles('ADMIN')
    @Post(':id/pdf')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: UPLOAD_DIR,
                filename: (_req, file, cb) => {
                    cb(null, `${randomUUID()}.pdf`)
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (file.mimetype !== 'application/pdf') {
                    cb(new BadRequestException('Only PDF files are allowed'), false)
                    return
                }
                cb(null, true)
            },
            limits: { fileSize: 20 * 1024 * 1024 },
        })
    )
    async uploadPdf(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded')
        }
        return this.protocolTemplateService.setPdf(id, {
            pdfUrl: `/uploads/protocols/${file.filename}`,
            pdfFileName: file.originalname,
        })
    }

    @Roles('ADMIN')
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.protocolTemplateService.remove(id)
    }
}
