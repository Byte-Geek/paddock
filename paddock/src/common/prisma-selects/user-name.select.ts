export const userNameSelect = {
    firstName: true,
    lastName: true,
    email: true,
} as const

export const userNameWithIdSelect = {
    id: true,
    ...userNameSelect,
} as const
