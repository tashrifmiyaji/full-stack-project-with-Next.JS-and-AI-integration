'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const Navbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("লগআউট সফল", {
      description: "আপনাকে হোম পেইজে নেওয়া হচ্ছে।"
    });
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 700);
  };

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a className="text-xl font-bold mb-4 md:mb-0" href="">Mystery Message</a>
        {
          session ? (
            <>
              <span className="mr-4">Welcome, {user?.username || user?.email}</span>
              <Button className="w-full md:w-auto" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button>Login</Button>
            </Link>
          )
        }
      </div>
    </nav>
  )
}

export default Navbar
