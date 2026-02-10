import { Controller, Post, Body, Get, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { CurrentUser } from '../common/decorators';

@Controller('api/v1/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getProfile(@CurrentUser('sub') userId: string) {
        return this.authService.getProfile(userId);
    }
}
