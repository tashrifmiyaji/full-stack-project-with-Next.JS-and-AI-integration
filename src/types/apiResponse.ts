import { Message } from "@/model/User.model";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    isVerified?: boolean;
    username?: string;
    messages?: Array<Message>
}
