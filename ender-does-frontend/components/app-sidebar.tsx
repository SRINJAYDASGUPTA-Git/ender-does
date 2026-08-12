"use client"

import * as React from "react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { FaUbuntu } from "react-icons/fa";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {ActivityIcon, RocketIcon, ServerIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "srinjay",
    email: "dasguptasrinjay2004@gmail.com",
    avatar: "https://avatars.githubusercontent.com/u/70833470?s=96&v=4",
  },
  teams: [
  {
    name: "homelab",
    logo: (
      <FaUbuntu />
    ),
    plan: "Ubuntu 24.04 LTS",
  },
],
  navMain: [
  {
    title: "Services",
    icon: <ServerIcon />,
    items: [
      {
    title: "EnderTest",
    url: "/services/endertest",
    icon: (
      <Image
        src="/apps/endertest.svg"
        alt="EnderTest"
        width={16}
        height={16}
        className="rounded-sm"
      />
    ),
  },

  {
    title: "EndrLink",
    url: "/services/endrlink",
    icon: (
      <Image
        src="/apps/endrlink.png"
        alt="EndrLink"
        width={16}
        height={16}
        className="rounded-sm"
      />
    ),
  },
  
  {
    title: "EnderBrary",
    url: "/services/enderbrary",
    icon: (
      <Image
        src="/apps/enderbrary.png"
        alt="EnderBrary"
        width={16}
        height={16}
        className="rounded-sm"
      />
    ),
  },
    ],
  },

  {
    title: "Deployments",
    icon: <RocketIcon />,
    items: [
      {
        title: "Recent Deployments",
        url: "/deployments",
      },
    ],
  },

  {
    title: "Monitoring",
    icon: <ActivityIcon />,
    items: [
      {
        title: "System Metrics",
        url: "/monitoring",
      },
      {
        title: "Logs",
        url: "/logs",
      },
    ],
  },
],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
