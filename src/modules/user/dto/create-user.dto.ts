export class CreateUserDto {
    email: string;
    password: string;
    confirmPassword: string;
    userName: string;
    birthDate: Date;
    name?: string;
    aboutMe?: string;
    averageRating?: number;
    city?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    profilePicture?: string;
}
