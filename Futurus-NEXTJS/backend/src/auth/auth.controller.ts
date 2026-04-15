import {
  Controller,
  Post,
  Get,
  Body,
  UnauthorizedException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 login attempts per minute
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(
      body.username || body.email,
      body.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active (assuming status 1 is active, 0 is banned)
    if (user.status === 0) {
      throw new UnauthorizedException(
        'Your account has been banned. Please contact support.',
      );
    }

    return this.authService.login(user);
  }

  @Post('verify-2fa')
  async verify2fa(@Body() body: { userId: number; code: string }) {
    const isValid = await this.usersService.verify2fa(body.userId, body.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    const user = await this.usersService.findById(body.userId);
    return await this.authService.login(user);
  }

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 300 } }) // 10 registrations per 5 minutes
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    // Auto-login after registration - return token like login does
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  // Alias for mobile app compatibility
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  // Forgot password - proxy to users service (mobile calls /auth/forgot-password)
  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 300 } }) // 5 requests per 5 minutes
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.sendResetCode(forgotPasswordDto.email);
  }

  // Reset password - proxy to users service (mobile calls /auth/reset-password)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  // Logout stub - mobile calls /auth/logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // JWT is stateless, so we just return success.
    // The mobile client handles clearing the token locally.
    return { message: 'Logged out successfully' };
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { access_token } = await this.authService.login(user);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`;
    res.redirect(redirectUrl);
  }

  // Facebook OAuth
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // Redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { access_token } = await this.authService.login(user);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`;
    res.redirect(redirectUrl);
  }
}
