import { Module } from '@nestjs/common'
import { ProtocolTemplateController } from './protocol-template.controller'
import { ProtocolTemplateService } from './protocol-template.service'

@Module({
    controllers: [ProtocolTemplateController],
    providers: [ProtocolTemplateService],
})
export class ProtocolTemplateModule {}
