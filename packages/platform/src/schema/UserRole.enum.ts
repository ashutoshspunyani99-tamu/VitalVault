import { UserRole } from '@vital_vault/prisma'
import { builder } from '../builder'

export const UserRoleEnum = builder.enumType(UserRole, {
  name: 'UserRole'
})
