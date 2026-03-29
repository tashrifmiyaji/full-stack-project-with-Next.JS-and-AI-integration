'use client'
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a className="text-xl font-bold mb-4 md:mb-0" href="">Mystery Message</a>
        {
          session ? (
            <>
              <span className="mr-4">Welcome, {user?.username || user?.email}</span>
              <Button className="w-full md:w-auto" onClick={() => signOut()}>Logout</Button>
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
