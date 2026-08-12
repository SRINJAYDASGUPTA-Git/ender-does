import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(request: NextRequest) {
    try {
        if (!IMGBB_API_KEY) {
            return NextResponse.json(
                { message: "Image upload is not configured." },
                { status: 500 }
            );
        }

        const accessToken =
            (await cookies()).get("access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const incoming = await request.formData();
        const image = incoming.get("image");

        if (!(image instanceof File)) {
            return NextResponse.json(
                { message: "No image provided." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                { message: "Only image files are allowed." },
                { status: 400 }
            );
        }

        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            return NextResponse.json(
                {
                    message: "Image upload failed.",
                },
                { status: response.status || 502 }
            );
        }

        return NextResponse.json({
            url: data.data.url,
        });
    } catch (error) {
        console.error("Avatar upload failed:", error);

        return NextResponse.json(
            { message: "Image upload service unavailable." },
            { status: 502 }
        );
    }
}