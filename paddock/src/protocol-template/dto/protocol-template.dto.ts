import { ProtocolElementDto } from './protocol-element.dto'

export class ProtocolTemplateDto {
    id: string
    name: string
    level: string | null
    description: string | null
    compositionYear: number | null
    revisionYear: number | null
    estimatedTimeSeconds: number | null
    scoringAlgorithm: string
    active: boolean
    elementCount: number
    categoryCount: number
    pdfUrl: string | null
    pdfFileName: string | null
}

export class ProtocolTemplateDetailDto extends ProtocolTemplateDto {
    elements: ProtocolElementDto[]
}
