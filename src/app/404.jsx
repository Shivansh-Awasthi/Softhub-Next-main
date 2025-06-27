import { Suspense } from "react";

// src/app/error.jsx

export default function CustomError({ error, reset }) {
    return (
        <Suspense fallback={<div>Loading page...</div>}>

            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-400">Something Went Wrong</h2>
                    <p className="mb-6">Please try again later.</p>
                    <button onClick={() => reset()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                        Try Again
                    </button>
                </div>
            </div>
        </Suspense>
    );
}
