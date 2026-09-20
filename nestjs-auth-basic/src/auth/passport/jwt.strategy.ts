import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';
import { IUser } from '@/users/users.interface';
import { RolesService } from '@/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private rolesService: RolesService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
        });
    }

    async validate(payload: IUser) {
        const account = await this.usersService.findOne(payload._id);
        if (!account) throw new UnauthorizedException();
        const { _id, name, email, role, company, phone } = account;
        const userRole = role as unknown as { _id: string; name: string } | null;
        const temp = userRole?._id
            ? await this.rolesService.findOne(userRole._id)
            : null;
        return {
            //cần gán thêm permissions vào req.user
            permissions: temp?.permissions ?? [],
            _id,
            name,
            email,
            role: userRole,
            company,
            phone,
        };
    }
}
