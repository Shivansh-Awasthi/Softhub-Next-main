"use client";
import SingleApp from '@/app/download/[platform]/[title]/[id]/SingleApp';
import LoadingSkeleton from './LoadingSkeleton';
import { useParams } from 'next/navigation';

export default function DownloadPage() {
    const params = useParams();
    const { id, platform, title } = params || {};

    return (
        <div className="min-h-screen text-white">
            <SingleApp id={id} platform={platform} title={title} />
        </div>
    );
}
