import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AppDataSource } from '../../../data/postgres/postgres-database';
import { User } from '../../../data/postgres/models/user.model';
import { LoginUserDto } from '../../../domain/dtos/auth/login-user.dto';
import { envs } from '../../../../src/config/envs';

export class LoginUserService {
  constructor() {}

  async execute(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign({ userId: user.id }, envs.JWT_SECRET!, {
      expiresIn: envs.JWT_EXPIRES_IN,
    } as SignOptions);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_number: user.account_number,
        balance: user.balance,
      },
    };
  }
}
