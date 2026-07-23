import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common'
import { EvaluationService } from './evaluation.service'
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'

@Controller('evaluations')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) {}

    @Get('by-participation/:participationId')
    async findAllForParticipation(
        @Param('participationId') participationId: string
    ) {
        return this.evaluationService.findAllForParticipation(participationId)
    }

    @Get()
    async find(
        @Query('participationId') participationId: string,
        @Query('categoryRefereeId') categoryRefereeId: string
    ) {
        return this.evaluationService.find(participationId, categoryRefereeId)
    }

    @Roles('ADMIN', 'MODERATOR')
    @Put()
    async upsert(
        @Body() dto: UpsertEvaluationDto,
        @CurrentUser('sub') userId: string
    ) {
        return this.evaluationService.upsert(dto, userId)
    }
}
