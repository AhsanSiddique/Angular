export class Login {
    userName!: string;
    password!: string;
    terminalId!:string;
    channel!:number;
}

export class LoginSuccess {
    userName!: string;
    accessToken!: string;
    refreshToken!: string;
}

export interface UserSendForgotPasswordEmailRequest {
  /** @format int64 */
  systemUserId?: number | null;
  systemUserName?: string | null;
  channel: number;
  email: string;
}
