
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return ApiResponse.error('No file found', 400);
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            console.error('IMGBB_API_KEY is not defined');
            return ApiResponse.error('Server configuration error: IMGBB_API_KEY missing', 500);
        }

        // Convert file to Blob/Buffer for ImgBB
        const buffer = await file.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        const imgbbFormData = new FormData();
        imgbbFormData.append('image', base64Image);

        // Upload to ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: imgbbFormData,
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('ImgBB Non-JSON Response:', responseText);
            return ApiResponse.error(`ImgBB Upload Failed: Invalid response from server. Status: ${response.status}`, 502);
        }

        if (!data.success) {
            console.error('ImgBB Upload Error:', JSON.stringify(data, null, 2));
            return ApiResponse.error(`ImgBB Upload Failed: ${data.error?.message || 'Unknown error'} (Status: ${response.status})`, 502);
        }

        // Return the URL
        // data.data.url is the direct link (or data.data.display_url)
        return ApiResponse.success({ url: data.data.url });

    } catch (error: any) {
        console.error('Upload error:', error);
        return ApiResponse.error('Internal server error during upload', 500);
    }
}
