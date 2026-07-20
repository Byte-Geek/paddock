export class HomeSummaryDto {
    athletes: number
    coaches: number
    groups: number
    championshipsThisYear: number
    modificationsLastMonth: {
        athletes: number
        coaches: number
        groups: number
    }
}
