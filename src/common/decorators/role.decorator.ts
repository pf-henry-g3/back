import { SetMetadata } from "@nestjs/common";
import { Role } from "src/common/enums/roles.enum";

export const Roles = (...role: Role[]) => SetMetadata('roles', role);