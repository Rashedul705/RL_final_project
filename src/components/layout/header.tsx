"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/components/cart/cart-context";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchDialog } from "@/components/search-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    <path d="M14.05 16.95A8.91 8.91 0 0 1 12.03 18c-2.61 0-4.93-1.63-5.9-4" />
  </svg>
);


export function Header() {
  const { cart } = useCart();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#categories", label: "Shop" },
    { href: "/#why-us", label: "About" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image src="/logo.png" alt="Rodelas Lifestyle" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-wide hidden sm:inline-block">Rodelas lifestyle</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-lg font-bold text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" asChild className="text-accent-foreground bg-accent hover:bg-accent/90 text-lg font-bold">
              <Link href="https://wa.me/8801776180359" target="_blank">
                <WhatsAppIcon className="h-5 w-5 mr-2" />
                <span className="hidden xl:inline">01776180359</span>
              </Link>
            </Button>
            <SearchDialog>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </SearchDialog>
          </div>

          <Link href="/checkout" passHref>
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Profile / Login Section */}
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || "/images/avatar-placeholder.png"} alt={user.displayName || "User"} />
                      <AvatarFallback>
                        <Image
                          src="/images/avatar-placeholder.png"
                          alt="User"
                          fill
                          className="object-cover rounded-full"
                        />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email || user.phoneNumber}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="hidden lg:flex">
                <Link href="/login">Login</Link>
              </Button>
            )
          )}

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <div className="flex flex-col gap-4 p-4">
                  <SheetClose asChild>
                    <Link href="/" className="text-lg font-bold flex items-center gap-2">
                      <div className="relative h-8 w-8">
                        <Image src="/logo.png" alt="Rodelas Lifestyle" fill className="object-contain" />
                      </div>
                      <span>Rodelas lifestyle</span>
                    </Link>
                  </SheetClose>
                  <nav className="flex flex-col gap-3">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    {!user && (
                      <SheetClose asChild>
                        <Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
                      </SheetClose>
                    )}
                    {user && (
                      <>
                        <SheetClose asChild>
                          <Link href="/profile" className="text-muted-foreground hover:text-foreground">Profile</Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <button onClick={handleLogout} className="text-left text-muted-foreground hover:text-red-600">Logout</button>
                        </SheetClose>
                      </>
                    )}

                  </nav>
                  <div className="mt-auto flex flex-col gap-4">
                    <CartSheet>
                      <Button variant="outline" className="relative justify-start">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        View Cart
                        {cartItemCount > 0 && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {cartItemCount}
                          </span>
                        )}
                      </Button>
                    </CartSheet>
                    <Button variant="outline" asChild>
                      <Link href="https://wa.me/8801776180359" target="_blank">
                        <WhatsAppIcon className="h-5 w-5 mr-2" />
                        WhatsApp
                      </Link>
                    </Button>
                    <SearchDialog>
                      <SheetClose asChild>
                        <Button variant="outline" className="justify-start">
                          <Search className="h-5 w-5 mr-2" />
                          Search
                        </Button>
                      </SheetClose>
                    </SearchDialog>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
