import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
 BellIcon,
 UserCircleIcon,
 Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/Breadcrumb";


export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
 breadcrumbs?: BreadcrumbItem[];
 onMenuToggle?: () => void;


 user?: {
   name: string;
   email: string;
   avatar?: string;
 };
 notifications?: number;
}


const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
 (
   { className, breadcrumbs, onMenuToggle, user, notifications = 0, ...props },
   ref
 ) => {
   return (
     <header
       ref={ref}
       className={cn(
         "bg-gradient-to-r from-surface to-surface-light border-b border-border-light px-3 py-11 mb-2 sm:px-6 h-18 flex items-center relative shadow-sm",
         className
       )}
       {...props}
     >
       {/* Background Pattern */}
       <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
         <div
           className="absolute inset-0"
           style={{
             backgroundImage: `linear-gradient(90deg, var(--color-primary) 1px, transparent 1px), linear-gradient(0deg, var(--color-primary) 1px, transparent 1px)`,
             backgroundSize: "20px 20px",
           }}
         />
       </div>


       <div className="flex items-center justify-between w-full relative">
         {/* Left Section */}
         <div className="flex items-center space-x-3 sm:space-x-4">
           {/* Mobile Menu Button */}
           <button
             onClick={onMenuToggle}
             className="lg:hidden p-2.5 rounded-xl hover:bg-accent text-secondary-text hover:text-primary-text transition-all duration-200 hover-lift shadow-sm"
           >
             <Bars3Icon className="h-5 w-5" />
           </button>

           {/* B2B CRM Logo */}
           <Link 
             href="/" 
             className="flex items-center space-x-3 group transition-all duration-200 hover:scale-[1.02]"
             aria-label="Back2Back Gym CRM - Go to Dashboard"
           >
             <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
               <Image
                 src="/images/b2b-gym-logo.png"
                 alt="B2B Gym CRM Logo"
                 width={64}
                 height={64}
                 className="object-contain transition-transform duration-200 group-hover:scale-105"
                 priority
                 onError={(e) => {
                   // Fallback to original design if image fails to load
                   const target = e.target as HTMLImageElement;
                   target.style.display = 'none';
                   const parent = target.parentElement;
                   if (parent) {
                     parent.innerHTML = `
                       <div class="w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                         <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-inner">
                           <span class="text-lg font-black text-primary tracking-tight">B2</span>
                         </div>
                       </div>
                     `;
                   }
                 }}
               />
             </div>
             <div className="hidden sm:block">
               <span className="text-primary-text font-bold text-xl tracking-wide bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-primary transition-all duration-200">
                 Back2Back
               </span>
               <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary-light rounded-full mt-1 group-hover:w-20 transition-all duration-200"></div>
             </div>
           </Link>

           {/* Separator */}
           <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent"></div>


           {/* Breadcrumbs */}
           {breadcrumbs && breadcrumbs.length > 0 && (
             <div className="hidden sm:block">
               <Breadcrumb items={breadcrumbs} />
             </div>
           )}
         </div>


         {/* Center Section - Clean space for page context */}
         <div className="hidden md:flex flex-1 justify-center">
           {/* This space can be used for page-specific context or remain clean */}
         </div>


         {/* Right Section */}
         <div className="flex items-center space-x-2 sm:space-x-3">
           {/* Separator */}
           <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent"></div>


           {/* Notifications */}
           <button className="relative p-2.5 rounded-xl hover:bg-accent text-secondary-text hover:text-primary-text transition-all duration-200 hover-lift shadow-sm group">
             <BellIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
             {notifications > 0 && (
               <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-danger to-danger text-white text-xs rounded-full flex items-center justify-center shadow-lg font-bold animate-pulse">
                 {notifications > 99 ? "99+" : notifications}
               </span>
             )}
           </button>


           {/* User Profile */}
           <div className="flex items-center space-x-2 sm:space-x-3">
             {user ? (
               <div className="flex items-center space-x-3">
                 <div className="text-right hidden sm:block">
                   <p className="text-sm font-medium text-primary-text">
                     {user.name}
                   </p>
                   <p className="text-xs text-secondary-text font-normal">
                     {user.email}
                   </p>
                 </div>
                 <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-accent transition-all duration-200 hover-lift shadow-sm group">
                   {user.avatar ? (
                     <div className="relative">
                       <Image
                         src={user.avatar}
                         alt={user.name}
                         width={32}
                         height={32}
                         className="h-8 w-8 rounded-full ring-2 ring-border-light group-hover:ring-primary/30 transition-all duration-200"
                       />
                       {/* Online indicator */}
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface shadow-sm"></div>
                     </div>
                   ) : (
                     <div className="relative">
                       <UserCircleIcon className="h-8 w-8 text-secondary-text group-hover:text-primary transition-colors duration-200" />
                       {/* Online indicator */}
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface shadow-sm"></div>
                     </div>
                   )}
                 </button>
               </div>
             ) : (
               <Button
                 variant="primary"
                 size="sm"
                 className="hidden sm:inline-flex hover-lift"
               >
                 Sign In
               </Button>
             )}
           </div>
         </div>
       </div>


       {/* Mobile Breadcrumbs */}
       {breadcrumbs && breadcrumbs.length > 0 && (
         <div className="mt-3 sm:hidden border-t border-border-light pt-3">
           <Breadcrumb items={breadcrumbs} />
         </div>
       )}
     </header>
   );
 }
);


Header.displayName = "Header";


export { Header };