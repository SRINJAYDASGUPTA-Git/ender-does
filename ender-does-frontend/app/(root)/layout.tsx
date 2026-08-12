import {AppSidebar} from '@/components/app-sidebar';
import {SidebarProvider} from '@/components/ui/sidebar';
import {TooltipProvider} from '@/components/ui/tooltip';
import React from 'react'

export default function HomeLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TooltipProvider>
            </TooltipProvider>
    )
}