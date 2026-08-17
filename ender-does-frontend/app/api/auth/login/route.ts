import { NextRequest, NextResponse } from "next/server";
import {AuthenticationResponse} from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data:AuthenticationResponse = await backendResponse.json();
        console.log({data})
        if (!backendResponse.ok) {
            return NextResponse.json(data, {
                status: backendResponse.status,
            });
        }

        const response = NextResponse.json(
            { message: "Login successful" },
            { status: 200 }
        );

        response.cookies.set("access_token", data.access_token, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "lax",
            path: "/"
        });

        response.cookies.set("refresh_token", data.refresh_token, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return response;
    } catch (error) {
        console.error("Login proxy failed:", error);

        return NextResponse.json(
            { message: "Authentication service unavailable." },
            { status: 502 }
        );
    }
}