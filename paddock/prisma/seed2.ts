import {
    PrismaClient,
    Role,
    EventStatus,
    ParticipationStatus,
    ScoringAlgorithm,
    ScoringMethod,
    ElementType,
    ErrorType,
} from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'
import * as bcrypt from 'bcrypt'

config()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    throw new Error(
        'DATABASE_URL is not set. Configure your database connection before running the seed. See .env.example for an example.'
    )
}
//asd

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: databaseUrl,
    }),
})
async function hash(password: string) {
    return bcrypt.hash(password, 10)
}

async function main() {
    console.log('Seeding...')

    // --- Clean up (ordine inversa fata de dependinte) ---
    await prisma.evaluationError.deleteMany()
    await prisma.score.deleteMany()
    await prisma.evaluation.deleteMany()
    await prisma.participation.deleteMany()
    await prisma.categoryReferee.deleteMany()
    await prisma.category.deleteMany()
    await prisma.protocolElement.deleteMany()
    await prisma.protocolTemplate.deleteMany()
    await prisma.eventSecretary.deleteMany()
    await prisma.event.deleteMany()
    await prisma.groupAthlete.deleteMany()
    await prisma.group.deleteMany()
    await prisma.athlete.deleteMany()
    await prisma.coach.deleteMany()
    await prisma.user.deleteMany()

    // --- Users ---
    const moderatorUser = await prisma.user.create({
        data: {
            email: 'moderator@example.com',
            password: await hash('Parola123!'),
            firstName: 'Ion',
            lastName: 'Moderatorul',
            role: Role.MODERATOR,
        },
    })

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: await hash('Parola123!'),
            firstName: 'Ana',
            lastName: 'Secretara',
            role: Role.ADMIN,
        },
    })

    const coachUser = await prisma.user.create({
        data: {
            email: 'antrenor@example.com',
            password: await hash('Parola123!'),
            firstName: 'Victor',
            lastName: 'Antrenorul',
            role: Role.COACH,
        },
    })

    const athleteUser1 = await prisma.user.create({
        data: {
            email: 'sportiv1@example.com',
            password: await hash('Parola123!'),
            firstName: 'Mihai',
            lastName: 'Sportivul',
            role: Role.ATHLETE,
        },
    })

    const athleteUser2 = await prisma.user.create({
        data: {
            email: 'sportiv2@example.com',
            password: await hash('Parola123!'),
            firstName: 'Elena',
            lastName: 'Sportiva',
            role: Role.ATHLETE,
        },
    })

    // Antrenorul poate concura si el ca sportiv -> are si profil de Athlete
    const coachAsAthleteUser = coachUser

    // --- Coach + Athlete profiles ---
    const coach = await prisma.coach.create({
        data: { userId: coachUser.id },
    })

    const athlete1 = await prisma.athlete.create({
        data: { userId: athleteUser1.id },
    })

    const athlete2 = await prisma.athlete.create({
        data: { userId: athleteUser2.id },
    })

    const coachAsAthlete = await prisma.athlete.create({
        data: { userId: coachAsAthleteUser.id },
    })

    // --- Group ---
    const group = await prisma.group.create({
        data: {
            coachId: coach.id,
            name: 'Grupa Avansati',
            description: 'Grupa de pregatire pentru competitii nationale',
        },
    })

    await prisma.groupAthlete.createMany({
        data: [
            { groupId: group.id, athleteId: athlete1.id },
            { groupId: group.id, athleteId: athlete2.id },
        ],
    })

    // --- Event ---
    const event = await prisma.event.create({
        data: {
            name: 'Cupa Nationala 2026',
            location: 'Chisinau, Moldova',
            startDate: new Date('2026-09-12'),
            endDate: new Date('2026-09-13'),
            description: 'Competitie nationala de calificare',
            status: EventStatus.PUBLISHED,
            secretaries: {
                create: [{ userId: adminUser.id }],
            },
        },
    })

    // --- Protocol template (dupa modelul FEI din discutie) ---
    const template = await prisma.protocolTemplate.create({
        data: {
            name: 'Mic Premiu',
            level: 'Nivel Incepatori',
            description: 'Protocol standard pentru nivelul incepatori',
            compositionYear: 2009,
            revisionYear: 2022,
            estimatedTimeSeconds: 350, // 5 min 50 sec
            scoringAlgorithm: ScoringAlgorithm.SUM,
            active: true,
            elements: {
                create: [
                    {
                        order: 1,
                        number: 1,
                        letters: 'A',
                        name: 'Intrare pe galop adunat',
                        judgingCriteria:
                            'Mentinerea ritmului, tranzitie precisa si lina, incadrare',
                        elementType: ElementType.MOVEMENT,
                        scoringMethod: ScoringMethod.NUMERIC_0_10,
                        maxScore: 10,
                        scoreStep: 0.5,
                        coefficient: 1,
                    },
                    {
                        order: 2,
                        number: 2,
                        letters: 'C',
                        name: 'Directia dreapta',
                        judgingCriteria:
                            'Regularitate si calitatea trapului, sustinerea aliurii',
                        elementType: ElementType.MOVEMENT,
                        scoringMethod: ScoringMethod.NUMERIC_0_10,
                        maxScore: 10,
                        scoreStep: 0.5,
                        coefficient: 1,
                    },
                    {
                        order: 3,
                        number: 3,
                        letters: 'FB',
                        name: 'Umar inauntru stanga',
                        judgingCriteria:
                            'Regularitate, incovoiere constanta, echilibru',
                        elementType: ElementType.MOVEMENT,
                        scoringMethod: ScoringMethod.NUMERIC_0_10,
                        maxScore: 10,
                        scoreStep: 0.5,
                        coefficient: 2,
                    },
                    {
                        order: 4,
                        number: 26,
                        letters: 'X',
                        name: 'Impresia generala',
                        judgingCriteria:
                            'Armonia perechii, pozitia calaretului, corectitudinea ajutoarelor',
                        elementType: ElementType.COLLECTIVE,
                        scoringMethod: ScoringMethod.NUMERIC_0_10,
                        maxScore: 10,
                        scoreStep: 0.5,
                        coefficient: 2,
                    },
                ],
            },
        },
        include: { elements: true },
    })

    // --- Category ---
    const category = await prisma.category.create({
        data: {
            eventId: event.id,
            protocolTemplateId: template.id,
            name: 'Categoria Incepatori Feminin/Masculin',
            referees: {
                create: [
                    {
                        firstName: 'Grigore',
                        lastName: 'Popa',
                        letterCode: 'C',
                        position: 'C',
                    },
                    {
                        firstName: 'Maria',
                        lastName: 'Ionescu',
                        letterCode: 'H',
                        position: 'H',
                    },
                ],
            },
        },
        include: { referees: true },
    })

    const [refereeC, refereeH] = category.referees

    // --- Participations ---
    const participation1 = await prisma.participation.create({
        data: {
            athleteId: athlete1.id,
            categoryId: category.id,
            horseName: 'Bucefal',
            participationNumber: 1,
            status: ParticipationStatus.COMPETED,
        },
    })

    const participation2 = await prisma.participation.create({
        data: {
            athleteId: athlete2.id,
            categoryId: category.id,
            horseName: 'Sageata',
            participationNumber: 1,
            status: ParticipationStatus.COMPETED,
        },
    })

    // Antrenorul concureaza si el, ca sportiv, in aceeasi categorie
    const participationCoach = await prisma.participation.create({
        data: {
            athleteId: coachAsAthlete.id,
            categoryId: category.id,
            horseName: 'Vantul',
            participationNumber: 1,
            status: ParticipationStatus.COMPETED,
        },
    })

    // --- Evaluations + Scores pentru participation1 (2 arbitri => 2 evaluari) ---
    for (const [referee, baseValue] of [
        [refereeC, 7.5],
        [refereeH, 8.0],
    ] as const) {
        const evaluation = await prisma.evaluation.create({
            data: {
                participationId: participation1.id,
                categoryRefereeId: referee.id,
                enteredByUserId: adminUser.id,
                finalized: true,
            },
        })

        await prisma.score.createMany({
            data: template.elements.map((el, idx) => ({
                evaluationId: evaluation.id,
                elementId: el.id,
                value: baseValue + (idx % 2 === 0 ? 0.5 : -0.5),
                remark: idx === 0 ? 'Tranzitie buna' : null,
            })),
        })
    }

    // Exemplu de eroare de traseu pentru participation2
    const evaluationWithError = await prisma.evaluation.create({
        data: {
            participationId: participation2.id,
            categoryRefereeId: refereeC.id,
            enteredByUserId: adminUser.id,
            finalized: true,
        },
    })

    await prisma.score.createMany({
        data: template.elements.map((el) => ({
            evaluationId: evaluationWithError.id,
            elementId: el.id,
            value: 6.5,
        })),
    })

    await prisma.evaluationError.create({
        data: {
            evaluationId: evaluationWithError.id,
            errorType: ErrorType.COURSE_ERROR,
            occurrence: 1,
            deductionPercent: 2,
        },
    })

    console.log('Seed complet.')
    console.log({
        users: 5,
        event: event.name,
        template: template.name,
        category: category.name,
        participations: 3,
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
