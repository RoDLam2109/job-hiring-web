import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '@/users/users.interface';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { Company } from '@/companies/schemas/company.schemas';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { RolesService } from '../roles/roles.service';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { Request as ExpressReq, Response } from 'express'

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService,
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>
    ) { }


    async validateUser(username: string, pass: string): Promise<any> {
        // username  va pass là 2 tham số thư viện passport ném về
        const user = await this.usersService.findOneByUserName(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if (isValid === true) {
                const userRole = user.role as unknown as { _id: string; name: string } | null;
                const role = userRole?._id
                    ? await this.rolesService.findOne(userRole._id)
                    : null;

                const objUser = {
                    ...user.toObject(),
                    permissions: role?.permissions ?? [],
                };
                return objUser;
            }
        }
        return null;
    }
    async login(user: IUser, response: Response) {
        const { _id, name, email, role, permissions, company } = user;

        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };

        const refresh_token = this.createRefreshToken(payload)

        // update user with refresh token
        await this.usersService.updateUserToken(_id, refresh_token)

        //set refresh token as cookies
        response.cookie('refresh_token', refresh_token,
            {
                httpOnly: true,
                maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
            })

        return {
            access_token: this.jwtService.sign(payload),

            user: {
                _id,
                name,
                email,
                role,
                permissions: permissions ?? [],
                company: company ?? null,
            }
        };
    }



    async register(registerUserDto: RegisterUserDto) {
        const hashPassword = this.usersService.getHashPassword(registerUserDto.password);
        const user = await this.usersService.register(registerUserDto);
        const { _id, createdAt } = user
        return { _id, createdAt };

    };

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000
        })
        return refreshToken;
    }

    processNewToken = async (refresh_token: string, response: Response) => {
        try {
            this.jwtService.verify(refresh_token, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET')
            })

            const user = await this.usersService.findUserByToken(refresh_token);
            if (user) {
                // update refresh token
                const { _id, name, email, role } = user;

                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };

                const refresh_token = this.createRefreshToken(payload)

                // update user with refresh token
                await this.usersService.updateUserToken(_id.toString(), refresh_token)

                // fetch user's role
                const userRole = user.role as unknown as { _id: string; name: string };
                const temp = await this.rolesService.findOne(userRole._id);

                response.clearCookie('refresh_token');
                //set refresh token as cookies
                response.cookie('refresh_token', refresh_token,
                    {
                        httpOnly: true,
                        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
                    })

                return {
                    access_token: this.jwtService.sign(payload),

                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp?.permissions ?? [],
                    }
                };

            }
            else {
                throw new BadRequestException(`Refresh token không hợp lệ. Vui lòng login!`)
            }

        }
        catch (error) {
            throw new BadRequestException(`Refresh token không hợp lệ. Vui lòng login!`)
        }
    }

    logoutUser = async (response: Response, user: IUser) => {
        await this.usersService.updateUserToken(user._id, '')
        response.clearCookie('refresh_token')
        return 'ok'
    }
}
