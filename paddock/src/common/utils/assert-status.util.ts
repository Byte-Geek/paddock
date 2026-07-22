import { BadRequestException } from '@nestjs/common'

export function assertStatus(
    current: string,
    expected: string,
    message: string
): void {
    if (current !== expected) {
        throw new BadRequestException(message)
    }
}
