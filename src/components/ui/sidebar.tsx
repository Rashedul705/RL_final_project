
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDesktop: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isOpen, setIsOpen] = useState(false);

  const value = {
    isOpen,
    setIsOpen,
    isDesktop,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

const SidebarTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
    const { setIsOpen } = useSidebar();
    const Comp = asChild ? Slot : 'button';

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setIsOpen(true);
      if (onClick) {
        onClick(event);
      }
    };

    return <Comp ref={ref} onClick={handleClick} {...props} />;
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild = false, onClick, ...props }, ref) => {
    const { setIsOpen, isDesktop } = useSidebar();
    const Comp = asChild ? Slot : 'button';

    const handleClick = (event: React.MouseEvent<any>) => {
      if (!isDesktop) {
        setIsOpen(false);
      }
      if (onClick) {
        onClick(event as React.MouseEvent<HTMLButtonElement>);
      }
    };
    
    return <Comp ref={ref} onClick={handleClick} {...props} />;
});
SidebarClose.displayName = 'SidebarClose';


export {
  SidebarTrigger,
  SidebarClose,
};
