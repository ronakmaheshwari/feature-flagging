
export interface SignupInterface {
    success: boolean,
    message: string,
    user?: string
}

export interface UserDataInterface {
    id: string,
    username: string,
    email: string,
    createdAt: Date,
    userStatus: string,
    groups: Array<{
        name: string
    }>
}