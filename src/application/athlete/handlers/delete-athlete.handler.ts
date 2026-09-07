/**
 * Handler que ejecuta la eliminación lógica de un atleta.
 * Verifica ownership antes de eliminar.
 */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AthleteNotFoundException } from 'src/domain/athlete/exceptions/athlete-not-found.exception';
import { AthleteRepository } from 'src/domain/athlete/repositories/athlete.repository';
import { DeleteAthleteCommand } from '../commands/delete-athlete.command';

@CommandHandler(DeleteAthleteCommand)
export class DeleteAthleteHandler implements ICommandHandler<DeleteAthleteCommand, void> {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(command: DeleteAthleteCommand): Promise<void> {
    const athlete = await this.athleteRepository.findBySchoolAndId(
      command.schoolId,
      command.athleteId,
    );
    if (!athlete) {
      throw new AthleteNotFoundException(command.athleteId);
    }
    await this.athleteRepository.softDelete(command.athleteId);
  }
}
