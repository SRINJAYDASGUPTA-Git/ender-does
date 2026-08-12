"use client"

import * as React from "react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {CheckSquare2Icon} from "lucide-react"
import {useUser} from "@/providers/UserContext";
import {toast} from "@/components/ui/toast"
import {useRouter} from "next/navigation";
import Link from "next/link";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {user, loading} = useUser()
    const router = useRouter();

    if (loading) {
        return (
            <></>
        )
    }

    if (!user) {
        toast.add({
            type: "error",
            description: "Not logged in",
            priority: "high",
        })
        router.push("/login")
    }
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="cursor-default hover:bg-transparent"
                        >
                            <Link href="/" className="flex items-center justify-between w-[65%]">
                                <div
                                    className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <CheckSquare2Icon className="size-4"/>
                                </div>

                                <div className="flex flex-col text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    EnderDoes
                                </span>

                                    <span className="truncate text-xs text-muted-foreground">
                                    Get things done.
                                </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>

                <NavMain/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user!}/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
