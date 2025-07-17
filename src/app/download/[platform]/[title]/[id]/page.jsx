import SingleApp from '@/app/download/[platform]/[title]/[id]/SingleApp';
import LoadingSkeleton from './LoadingSkeleton';

export default function DownloadPage({ params }) {
    // Pass all params to SingleApp for client-side fetching
    const { id, platform, title } = params || {};

    return (
        <div className="min-h-screen text-white">
            <SingleApp id={id} platform={platform} title={title} />
        </div>
    );
}
