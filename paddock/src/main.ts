import 'dotenv/config'

import { join } from 'path'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.enableCors();
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    )

    const config = new DocumentBuilder()
        .setTitle('Paddock backend')
        .setDescription('Paddock backend API')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const documentFactory = () => SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, documentFactory)

    app.setGlobalPrefix('api')
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

