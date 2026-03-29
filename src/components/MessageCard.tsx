'use client'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Message } from "@/model/User.model";
import { toast } from "sonner";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";


type MessageCardProps = {
    message: Message,
    onMessageDelete: (messageId: string) => void
}

const MessageCard = ({message, onMessageDelete}: MessageCardProps) => {
    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        toast.success(response.data.message)
        onMessageDelete(message._id.toString())
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Anonymous message</CardTitle>

                <CardAction>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <X className="w-5 h-5"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. The selected anonymous message will be removed permanently.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardAction>

                <CardDescription>
                    {new Date(message.createdAt).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>{message.content}</p>
            </CardContent>
        </Card>
    )
}

export default MessageCard
