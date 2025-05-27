import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { logger } from './logger';

const prisma = new PrismaClient();

// Configure local strategy for email/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            profile: true,
          },
        });

        // User not found
        if (!user) {
          logger.debug(`Login attempt failed: User not found - ${email}`);
          return done(null, false, { message: 'Usuário ou senha inválidos' });
        }

        // User is inactive or rejected
        if (user.status !== 'ACTIVE') {
          logger.debug(`Login attempt failed: User not active - ${email}`);
          return done(null, false, { message: 'Conta inativa ou não aprovada' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          logger.debug(`Login attempt failed: Invalid password - ${email}`);
          return done(null, false, { message: 'Usuário ou senha inválidos' });
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        logger.info(`User authenticated successfully: ${email}`);
        return done(null, userWithoutPassword);
      } catch (error) {
        logger.error('Error during authentication:', error);
        return done(error);
      }
    }
  )
);

// Configure JWT strategy for token authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    },
    async (jwtPayload, done) => {
      try {
        // Verify if the token has not expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (jwtPayload.exp <= currentTimestamp) {
          logger.debug(`JWT token expired for user ${jwtPayload.sub}`);
          return done(null, false, { message: 'Token expirado' });
        }

        // Find user by ID from JWT payload
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.sub },
          include: {
            profile: true,
          },
        });

        // User not found or not active
        if (!user || user.status !== 'ACTIVE') {
          logger.debug(`JWT token invalid: User not found or inactive - ${jwtPayload.sub}`);
          return done(null, false, { message: 'Usuário inválido ou inativo' });
        }

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        logger.error('Error during JWT authentication:', error);
        return done(error);
      }
    }
  )
);

export default passport;