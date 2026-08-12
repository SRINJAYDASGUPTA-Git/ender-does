import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";

const BACKEND_URL =
    process.env.BACKEND_URL ?? "http://localhost:8080";
async function getAccessToken() {
    const cookieStore = await cookies();

    return cookieStore.get("access_token")?.value;
}

function unauthorized() {
    return NextResponse.json(
        {message: "Unauthorized"},
        {status: 401}
    );
}

async function getBackendResponse(
    id: string,
    method: string,
    body?: unknown
) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        return unauthorized();
    }

    return fetch(
        `${BACKEND_URL}/api/v1/todo/${id}/reopen`,
        {
            method,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(body !== undefined && {
                    "Content-Type": "application/json",
                }),
            },
            ...(body !== undefined && {
                body: JSON.stringify(body),
            }),
            cache: "no-store",
        }
    );
}

export async function PATCH(
    request: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    try {
        const {id} = await params;

        const backendResponse = await getBackendResponse(
            id,
            "PATCH"
        );

        if (backendResponse instanceof NextResponse) {
            return backendResponse;
        }

        const data = await backendResponse.json();

        return NextResponse.json(data, {
            status: backendResponse.status,
        });
    } catch (error) {
        console.error("Todo PATCH proxy failed:", error);

        return NextResponse.json(
            {message: "Todo service unavailable."},
            {status: 502}
        );
    }
}