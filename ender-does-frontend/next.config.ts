import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.ibb.co",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "avatar.vercel.sh",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "covers.openlibrary.org",
                port: "",
                pathname: "/b/id/**",
            },
        ],
    },
};

export default nextConfig;