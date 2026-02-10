import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
    @IsString() @IsNotEmpty() name: string;
    @IsEmail() email: string;
    @IsString() @MinLength(8) password: string;
    @IsString() @IsNotEmpty() role: string;
    @IsOptional() @IsString() avatarUrl?: string;
}

export class UpdateUserDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsEmail() email?: string;
    @IsOptional() @IsString() @MinLength(8) password?: string;
    @IsOptional() @IsString() role?: string;
    @IsOptional() @IsString() avatarUrl?: string;
    @IsOptional() active?: boolean;
}
