/**
 * Entidad que representa un deportista en el dominio del sistema.
 *
 * Contiene los datos personales, físicos, educativos y deportivos del atleta.
 * El campo age se calcula desde birthDate y no se persiste directamente.
 */
export class Athlete {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly age: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null,
    public readonly documentTypeId?: string,
    public readonly documentNumber?: string,
    public readonly birthDate?: string,
    public readonly genderId?: string,
    public readonly birthCountryId?: string,
    public readonly birthDepartmentId?: string,
    public readonly birthCityId?: string,
    public readonly residenceCountryId?: string,
    public readonly residenceDepartmentId?: string,
    public readonly residenceCityId?: string,
    public readonly educationLevelId?: string,
    public readonly educationInstitution?: string,
    public readonly categoryId?: string,
    public readonly weight?: number,
    public readonly height?: number,
    public readonly schoolId?: string,
    public readonly disciplineId?: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly photoUrl?: string | null,
  ) {}
}
