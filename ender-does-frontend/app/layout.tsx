import type {Metadata} from "next";
import {Inter, Poppins} from "next/font/google";
import "./globals.css";
import {UserProvider} from "@/providers/UserContext";
import {Toaster} from "@/components/ui/toast";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
})

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: {
        default: "EnderDoes — Todo & Productivity App",
        template: "%s | EnderDoes",
    },

    description:
        "EnderDoes is a modern todo and productivity app that helps you organize tasks, manage your work, and get things done.",

    applicationName: "EnderDoes",

    keywords: [
        "EnderDoes",
        "todo app",
        "task manager",
        "productivity app",
        "task management",
        "todo list",
    ],

    authors: [
        {
            name: "EnderDoes",
        },
    ],

    robots: {
        index: true,
        follow: true,
    },

    alternates: {
        canonical: "https://enderdoes.srinjaydg.in/",
    },

    openGraph: {
        type: "website",
        siteName: "EnderDoes",
        title: "EnderDoes — Todo & Productivity App",
        description:
            "Organize your tasks, manage your work, and get things done with EnderDoes.",
        url: "https://enderdoes.srinjaydg.in/",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "EnderDoes — Todo & Productivity App",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "EnderDoes — Todo & Productivity App",
        description:
            "Organize your tasks, manage your work, and get things done with EnderDoes.",
        images: ["/og-image.png"],
    },

    icons: {
        icon: [
            {
                url: "/icon.svg",
                type: "image/svg+xml",
            },
            {
                url: "/favicon.ico",
            },
        ],
        apple: "/apple-touch-icon.png",
    },

    manifest: "/manifest.webmanifest",
};

export default function RootLayout({children}: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${poppins.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <UserProvider>
            {children}
            <Toaster/>
        </UserProvider>
        </body>
        </html>
    );
}
