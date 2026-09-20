import { Body, Controller, Get, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, SkipPermission, User } from '@/decorator/customize';
import { LocalAuthGuard } from './local-auth-guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { Request as ExpressReq, Response } from 'express'
import { JwtStrategy } from './passport/jwt.strategy';
import { IUser } from '@/users/users.interface';
import { RolesService } from '@/roles/roles.service';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly rolesService: RolesService
    ) { }
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage('User login')
    handleLogin(@Res({ passthrough: true }) response: Response,
        @Request() req) {
        return this.authService.login(req.user, response)
    }

    @Public()
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto)
    }

    @ResponseMessage('Get user information')
    @SkipPermission()
    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
        const role = user.role?._id
            ? await this.rolesService.findOne(user.role._id)
            : null;
        return { user: { ...user, permissions: role?.permissions ?? [] } };
    }

    @Public()
    @ResponseMessage('Get user refresh token')
    @Get('/refresh')
    handleRefreshToken(@Req() request: ExpressReq, @Res({ passthrough: true }) response: Response) {
        const refresh_token = request.cookies['refresh_token']
        return this.authService.processNewToken(refresh_token, response)
    }

    @ResponseMessage('Logout user')
    @Post()
    logoutUser(@Req() respose: Response ,user : IUser) {
        return this.authService.logoutUser(respose,user)
    }

}
