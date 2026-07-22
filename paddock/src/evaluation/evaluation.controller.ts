import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common'
import { EvaluationService } from './evaluation.service'
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto'
import { Roles } from '../auth/decorators/roles.decorator'

interface AuthenticatedRequest {
    user: { email: string; sub: string; role: string }
}

@Controller('evaluations')
export class EvaluationController {
    constructor(private readonly evaluationService: EvaluationService) {}

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
        @Req() req: AuthenticatedRequest
    ) {
        return this.evaluationService.upsert(dto, req.user.sub)
    }
}
