/**
 * Controller REST para la gestión de atletas/deportistas.
 *
 * Expone endpoints para crear, consultar, listar, actualizar, eliminar
 * y subir fotografía de atletas. Todos los endpoints requieren autenticación
 * y verifican ownership por institución (schoolId del JWT).
 */
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { AuthenticatedRequest } from 'src/infrastructure/auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from 'src/infrastructure/auth/http/guard/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/auth/http/guard/roles.guard';
import { Roles } from 'src/infrastructure/auth/http/decorators/roles.decorator';
import { UserRole } from 'src/domain/auth/entities/user-role.enum';
import { AthleteDto } from 'src/application/athlete/dto/athlete.dto';
import { RegisterAthleteCommand } from 'src/application/athlete/commands/register-athlete.command';
import { UpdateAthleteCommand } from 'src/application/athlete/commands/update-athlete.command';
import { DeleteAthleteCommand } from 'src/application/athlete/commands/delete-athlete.command';
import { ListAthletesQuery } from 'src/application/athlete/queries/list-athletes.query';
import { GetAthleteQuery } from 'src/application/athlete/queries/get-athlete.query';
import { AthleteAlreadyExistsException } from 'src/domain/athlete/exceptions/athlete-already-exists.exception';
import { AthleteNotFoundException } from 'src/domain/athlete/exceptions/athlete-not-found.exception';
import { EmailAlreadyInUseException } from 'src/domain/auth/exceptions/email-already-in-use.exception';
import { CategoryNotFoundException } from 'src/domain/category/exceptions/category-not-found.exception';
import { CityNotFoundException } from 'src/domain/city/exceptions/city-not-found.exception';
import { CountryNotFoundException } from 'src/domain/country/exceptions/country-not-found.exception';
import { DepartmentNotFoundException } from 'src/domain/department/exceptions/department-not-found.exception';
import { DisciplineNotFoundException } from 'src/domain/discipline/exceptions/discipline-not-found.exception';
import { DocumentTypeNotFoundException } from 'src/domain/document-type/exceptions/document-type-not-found.exception';
import { EducationLevelNotFoundException } from 'src/domain/education-level/exceptions/education-level-not-found.exception';
import { GenderNotFoundException } from 'src/domain/gender/exceptions/gender-not-found.exception';
import { SchoolNotFoundException } from 'src/domain/school/exceptions/school-not-found.exception';
import { RegisterAthleteDto } from '../dtos/register-athlete.dto';
import { UpdateAthleteDto } from '../dtos/update-athlete.dto';
import { ListAthletesDto } from '../dtos/list-athletes.dto';
import { PaginatedAthleteDto } from '../dtos/paginated-athlete.dto';
import { UploadPhotoResponseDto } from '../dtos/upload-photo.dto';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import type { AthleteListResult } from 'src/domain/athlete/repositories/athlete.repository';
import { mapAthleteToDto } from 'src/application/athlete/mappers/athlete.mapper';

@ApiTags('Athletes')
@ApiBearerAuth()
@Controller('athletes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AthleteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly athleteRepository: AthleteRepository,
  ) {}

  private extractSchoolId(req: AuthenticatedRequest): string {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new NotFoundException('Usuario no tiene institución asociada');
    }
    return schoolId;
  }

  @Post()
  @Roles(UserRole.SCHOOL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo deportista' })
  @ApiBody({ type: RegisterAthleteDto })
  @ApiCreatedResponse({ type: AthleteDto, description: 'Deportista registrado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  @ApiNotFoundResponse({ description: 'Entidad referenciada no encontrada' })
  @ApiConflictResponse({ description: 'Documento o email duplicado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async register(
    @Body() dto: RegisterAthleteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AthleteDto> {
    const schoolId = this.extractSchoolId(req);
    try {
      return await this.commandBus.execute(
        new RegisterAthleteCommand(
          dto.documentTypeId,
          dto.documentNumber,
          dto.firstName,
          dto.lastName,
          dto.birthDate,
          dto.genderId,
          dto.birthCountryId,
          dto.birthDepartmentId,
          dto.birthCityId,
          dto.residenceCountryId,
          dto.residenceDepartmentId,
          dto.residenceCityId,
          dto.educationLevelId,
          dto.educationInstitution,
          dto.categoryId,
          dto.weight,
          dto.height,
          schoolId,
          dto.disciplineId,
          dto.email,
          dto.phone,
        ),
      );
    } catch (error) {
      this.mapDomainError(error);
    }
  }

  @Get()
  @Roles(UserRole.SCHOOL, UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Listar deportistas de la institución' })
  @ApiOkResponse({ type: PaginatedAthleteDto })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async list(
    @Query() dto: ListAthletesDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaginatedAthleteDto> {
    const schoolId = this.extractSchoolId(req);
    const result: AthleteListResult = await this.queryBus.execute(
      new ListAthletesQuery(
        schoolId,
        dto.search,
        dto.categoryId,
        dto.disciplineId,
        dto.genderId,
        dto.page,
        dto.limit,
      ),
    );
    return {
      data: result.data.map(mapAthleteToDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL, UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Obtener un deportista por ID' })
  @ApiParam({ name: 'id', description: 'ID del deportista' })
  @ApiOkResponse({ type: AthleteDto })
  @ApiNotFoundResponse({ description: 'Deportista no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<AthleteDto> {
    const schoolId = this.extractSchoolId(req);
    try {
      return await this.queryBus.execute(new GetAthleteQuery(schoolId, id));
    } catch (error) {
      this.mapDomainError(error);
    }
  }

  @Put(':id')
  @Roles(UserRole.SCHOOL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar datos de un deportista' })
  @ApiParam({ name: 'id', description: 'ID del deportista' })
  @ApiBody({ type: UpdateAthleteDto })
  @ApiOkResponse({ type: AthleteDto })
  @ApiNotFoundResponse({ description: 'Deportista no encontrado' })
  @ApiConflictResponse({ description: 'Documento o email duplicado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAthleteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AthleteDto> {
    const schoolId = this.extractSchoolId(req);
    try {
      return await this.commandBus.execute(
        new UpdateAthleteCommand(
          schoolId,
          id,
          dto.documentTypeId,
          dto.documentNumber,
          dto.firstName,
          dto.lastName,
          dto.birthDate,
          dto.genderId,
          dto.birthCountryId,
          dto.birthDepartmentId,
          dto.birthCityId,
          dto.residenceCountryId,
          dto.residenceDepartmentId,
          dto.residenceCityId,
          dto.educationLevelId,
          dto.educationInstitution,
          dto.categoryId,
          dto.weight,
          dto.height,
          dto.disciplineId,
          dto.email,
          dto.phone,
        ),
      );
    } catch (error) {
      this.mapDomainError(error);
    }
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un deportista (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del deportista' })
  @ApiOkResponse({ description: 'Deportista eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Deportista no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const schoolId = this.extractSchoolId(req);
    try {
      await this.commandBus.execute(new DeleteAthleteCommand(schoolId, id));
      return { message: 'Deportista eliminado exitosamente' };
    } catch (error) {
      this.mapDomainError(error);
    }
  }

  @Post(':id/photo')
  @Roles(UserRole.SCHOOL, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/athletes',
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png)$/i;
        if (!allowed.test(file.originalname)) {
          cb(new Error('Solo se permiten archivos JPG, JPEG o PNG'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Subir fotografía de un deportista' })
  @ApiParam({ name: 'id', description: 'ID del deportista' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: UploadPhotoResponseDto })
  @ApiNotFoundResponse({ description: 'Deportista no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string; originalname: string } | undefined,
    @Req() req: AuthenticatedRequest,
  ): Promise<UploadPhotoResponseDto> {
    const schoolId = this.extractSchoolId(req);

    const athlete = await this.athleteRepository.findBySchoolAndId(schoolId, id);
    if (!athlete) {
      throw new AthleteNotFoundException(id);
    }

    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    const photoUrl = `/uploads/athletes/${file.filename}`;
    await this.athleteRepository.updatePhoto(id, photoUrl);

    return {
      photoUrl,
      message: 'Fotografía subida exitosamente',
    };
  }

  private mapDomainError(error: unknown): never {
    if (
      error instanceof DocumentTypeNotFoundException ||
      error instanceof GenderNotFoundException ||
      error instanceof CountryNotFoundException ||
      error instanceof DepartmentNotFoundException ||
      error instanceof CityNotFoundException ||
      error instanceof EducationLevelNotFoundException ||
      error instanceof SchoolNotFoundException ||
      error instanceof DisciplineNotFoundException ||
      error instanceof CategoryNotFoundException
    ) {
      throw new NotFoundException(error.message);
    }
    if (
      error instanceof AthleteAlreadyExistsException ||
      error instanceof EmailAlreadyInUseException
    ) {
      throw new ConflictException(error.message);
    }
    if (error instanceof AthleteNotFoundException) {
      throw new NotFoundException(error.message);
    }
    throw error;
  }
}
