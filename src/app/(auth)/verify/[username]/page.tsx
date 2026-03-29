'use client'
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const VerifyAccountPage = () => {
    const router = useRouter()
    const params = useParams<{ username: string }>()

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post<ApiResponse>('/api/verify-code', {
                username: params.username,
                code: data.verifyCode
            });
            toast.success("ভেরিফিকেশন সফল", {
                description: response.data?.message
            })

            const pendingCredentials = sessionStorage.getItem("pending-verification-credentials")
            const parsedCredentials = pendingCredentials
                ? JSON.parse(pendingCredentials) as { identifier?: string; password?: string }
                : null

            if (
                parsedCredentials?.identifier === params.username &&
                parsedCredentials.password
            ) {
                const signInResult = await signIn("credentials", {
                    redirect: false,
                    identifier: parsedCredentials.identifier,
                    password: parsedCredentials.password,
                    callbackUrl: "/dashboard",
                })
                console.log("[verify] signIn result:", signInResult)

                if (signInResult?.ok || !signInResult?.error) {
                    sessionStorage.removeItem("pending-verification-credentials")
                    toast.success("লগইন সফল", {
                        description: "আপনাকে ড্যাশবোর্ডে নেওয়া হচ্ছে।"
                    })
                    setTimeout(() => {
                        console.log("[verify] redirecting to dashboard")
                        router.replace("/dashboard")
                        router.refresh()
                    }, 700)
                    return
                }
            }

            sessionStorage.removeItem("pending-verification-credentials")

            setTimeout(() => {
                router.replace(`/sign-in`)
            }, 700)
        } catch (error) {
            console.error("error in verify account!", error);
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error("ভেরিফিকেশন ব্যর্থ", {
                description: axiosError.response?.data.message ?? "ভেরিফিকেশন সম্পন্ন করা যায়নি।",
            })
        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Verify Account</h1>
                    <p className="mb-4">আপনার ইমেইলে পাঠানো ভেরিফিকেশন কোডটি লিখুন।</p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                name="verifyCode"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Verification Code</FormLabel>

                                            <FormControl>
                                                <Input placeholder="verify code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default VerifyAccountPage
