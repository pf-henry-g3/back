export class CreateUserDto {
    email: String;
    password: String;
    confirmPassword: String;
    userName: String;
    birthDate: Date;
    name?: String;
    aboutMe?: String;
    averageRating?: number;
    city?: String;
    country?: String;
    address?: String;
    latitude?: number;
    longitude?: number;
    profilePicture?: String;
}
