'use client'
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import { ApiResponse } from "@/types/apiResponse";

const SignInPage = () => {
    const router = useRouter()

    //
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        try {
            const userStatusResponse = await axios.post<ApiResponse>('/api/check-user-status', {
                identifier: data.identifier,
            })
            console.log("[sign-in] check-user-status:", userStatusResponse.data)

            if (!userStatusResponse.data.isVerified && userStatusResponse.data.username) {
                toast.error("অ্যাকাউন্ট ভেরিফাই করা হয়নি", {
                    description: "আগে আপনার ভেরিফিকেশন কোড দিয়ে অ্যাকাউন্ট ভেরিফাই করুন।"
                })
                setTimeout(() => {
                    console.log("[sign-in] redirecting to verify page")
                    router.replace(`/verify/${encodeURIComponent(userStatusResponse.data.username as string)}`)
                }, 700)
                return
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error("লগইন ব্যর্থ", {
                description: axiosError.response?.data.message ?? "ইউজার খুঁজে পাওয়া যায়নি।"
            })
            return
        }

        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
            callbackUrl: "/dashboard",
        })
        console.log("[sign-in] signIn result:", result)

        if (result?.error) {
            toast.error("লগইন ব্যর্থ", {
                description: "ইমেইল/ইউজারনেম অথবা পাসওয়ার্ড ভুল।"
            })
            return
        }

        if (result?.ok || !result?.error) {
            toast.success("লগইন সফল", {
                description: "আপনাকে ড্যাশবোর্ডে নেওয়া হচ্ছে।"
            })
            setTimeout(() => {
                console.log("[sign-in] redirecting to dashboard")
                router.replace("/dashboard")
                router.refresh()
            }, 700)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold">Join Mystery Message</h1>
                    <p className="mb-4">Sign In to start your anonymous adventure.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>email or username</FormLabel>

                                        <FormControl>
                                            <Input placeholder="email/username" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>

                                        <FormControl>
                                            <Input type="password" placeholder="password" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        <div className="flex justify-end">
                            <Button type="submit">
                                Signin
                            </Button>
                        </div>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Not registered?{' '}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignInPage
