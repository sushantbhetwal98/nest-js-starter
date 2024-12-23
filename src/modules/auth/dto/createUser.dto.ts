import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, { message: 'First Name must be 2 to 50 characters long' })
  @MinLength(2, { message: 'First Name must be 2 to 50 characters long' })
  first_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Middle Name must be 2 to 50 characters long' })
  @MinLength(2, { message: 'Middle Name must be 2 to 50 characters long' })
  middle_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Last Name must be 2 to 50 characters long' })
  @MaxLength(50, { message: 'Last Name must be 2 to 50 characters long' })
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}
