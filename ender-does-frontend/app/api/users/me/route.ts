import {NextRequest, NextResponse} from "next/server";
import { cookies } from "next/headers";
import { UserResponse } from "@/types";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8080";

export async function GET() {
    try {
        const cookieStore = await cookies();

        const accessToken =
            cookieStore.get("access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/me`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
            }
        );

        const data: UserResponse =
            await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("User proxy failed:", error);

        return NextResponse.json(
            {
                message:
                    "Authentication service unavailable.",
            },
            { status: 502 }
        );
    }
}
export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const accessToken =
            cookieStore.get("access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/users/me`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data: UserResponse =
            await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("User update proxy failed:", error);

        return NextResponse.json(
            { message: "User service unavailable." },
            { status: 502 }
        );
    }
}