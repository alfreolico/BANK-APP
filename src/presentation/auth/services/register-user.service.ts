import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import { RegisterUserDto } from '../../../domain/dtos/auth/register-user.dto';
import { BusinessError, DatabaseError } from '../../common/errors';
import { logError, logInfo } from '../../../utils/logger';
import { EmailService } from '../../../utils/email-service';

export class RegisterUserService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async execute(registerUserDto: RegisterUserDto): Promise<any> {
    const { name, email, password } = registerUserDto;

    try {
      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new BusinessError('El email ya está registrado', {
          email,
          action: 'register_user',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let accountNumber: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        if (attempts >= maxAttempts) {
          throw new DatabaseError('Error generando número de cuenta único', {
            attempts,
            maxAttempts,
          });
        }

        accountNumber = this.generateAccountNumber();
        const existingAccount = await userRepository.findOne({
          where: { account_number: accountNumber },
        });
        isUnique = !existingAccount;
        attempts++;
      } while (!isUnique);

      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        account_number: accountNumber,
        balance: 100.0,
      });

      const savedUser = await userRepository.save(user);

      try {
        await this.emailService.sendWelcomeEmail(
          savedUser.email,
          savedUser.name,
          savedUser.account_number
        );

        logInfo('Email de bienvenida enviado', {
          userId: savedUser.id,
          email: savedUser.email,
        });
      } catch (emailError) {
        logError('Error enviando email de bienvenida', emailError as Error, {
          userId: savedUser.id,
          email: savedUser.email,
        });
      }

      logInfo('Nuevo usuario creado', {
        userId: savedUser.id,
        email: savedUser.email,
        accountNumber: savedUser.account_number,
      });

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        account_number: savedUser.account_number,
        balance: savedUser.balance,
      };
    } catch (error) {
      if (error instanceof BusinessError || error instanceof DatabaseError) {
        throw error;
      }

      logError('Error en registro de usuario', error as Error, {
        email,
        action: 'register_user',
      });

      throw new DatabaseError('Error interno durante el registro', {
        originalError: (error as Error).message,
      });
    }
  }

  private generateAccountNumber(): string {
    return Math.floor(
      Math.random() * 90000000000000000000 + 10000000000000000000
    ).toString();
  }
}
