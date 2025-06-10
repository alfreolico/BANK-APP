/*import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import { RegisterUserDto } from '../../../domain/dtos/auth/register-user.dto';
import {
  AuthenticationError,
  BusinessError,
  DatabaseError,
} from '../../common/errors';
import { logError, logInfo, logWarn } from '../../../utils/logger';
import { envs } from '../../../config';
import * as jwt from 'jsonwebtoken';

export class RegisterUserService {
  constructor() {}

  async execute(registerUserDto: RegisterUserDto): Promise<any> {
    const { name, email, password } = registerUserDto;

    try {
      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        logWarn('Intento de registro con email ya existente', { email });
        throw new BusinessError('El email ya está registrado', { email });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        balance: 1000,
        account_number: this.generateAccountNumber(),
      });

      const savedUser = await userRepository.save(newUser);

      const token = jwt.sign({ userId: savedUser.id }, envs.JWT_SECRET!, {
        expiresIn: envs.JWT_EXPIRES_IN,
      });

      logInfo('Usuario registrado exitosamente', {
        userId: savedUser.id,
        email: savedUser.email,
      });

      return {
        token,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          account_number: savedUser.account_number,
          balance: savedUser.balance,
        },
      };
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }

      logError('Error en servicio de registro', error as Error, {
        email,
        action: 'register_user',
      });

      throw new DatabaseError('Error interno durante el registro');
    }
  }

  private generateAccountNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return timestamp + random;
  }
}
*/

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

      // Verificar si el usuario ya existe
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new BusinessError('El email ya está registrado', {
          email,
          action: 'register_user',
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generar número de cuenta único
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

      // Crear usuario
      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        account_number: accountNumber,
        balance: 100.0,
      });

      const savedUser = await userRepository.save(user);

      // ENVIAR EMAIL DE BIENVENIDA
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
        // No fallar el registro si el email falla
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
