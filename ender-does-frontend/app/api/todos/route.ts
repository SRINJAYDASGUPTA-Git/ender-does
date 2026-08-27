import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8080";

async function getAccessToken() {
    const cookieStore = await cookies();

    return cookieStore.get("access_token")?.value;
}

async function unauthorized() {
    return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
    );
}

export async function GET() {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return unauthorized();
        }

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/todo/`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                cache: "no-store",
            }
        );

        const data = await backendResponse.json();
        console.log(data)
        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Todo GET proxy failed:", error);

        return NextResponse.json(
            { message: "Todo service unavailable." },
            { status: 502 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            return unauthorized();
        }

        const body = await request.json();

        const backendResponse = await fetch(
            `${BACKEND_URL}/api/v1/todo/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(body),
                cache: "no-store",
            }
        );

        const data = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Todo POST proxy failed:", error);

        return NextResponse.json(
            { message: "Todo service unavailable." },
            { status: 502 }
        );
    }
}