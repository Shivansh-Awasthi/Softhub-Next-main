'use client';

import React, { useState, useRef, useEffect } from 'react';

const DescriptionTabs = ({ data }) => {
    const [activeTab, setActiveTab] = useState('description');
    const [showMore, setShowMore] = useState(false);
    const [linePosition, setLinePosition] = useState('0px');
    const [lineWidth, setLineWidth] = useState('0px');
    const descriptionRef = useRef(null);
    const installationRef = useRef(null);
    const isMac = data?.platform === "Mac";

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        const element = tab === 'description' ? descriptionRef.current : installationRef.current;
        if (element) {
            const { offsetLeft, offsetWidth } = element;
            setLinePosition(`${offsetLeft - 48}px`);
            setLineWidth(`${offsetWidth + 10}px`);
        }
    };

    const toggleShowMore = () => {
        setShowMore(!showMore);
    };

    useEffect(() => {
        if (isMac && descriptionRef.current) {
            const { offsetLeft, offsetWidth } = descriptionRef.current;
            setLinePosition(`${offsetLeft - 48}px`);
            setLineWidth(`${offsetWidth + 10}px`);
        }
    }, [isMac]);

    if (!data) {
        return <div>Loading description...</div>;
    }

    return (
        <div className="mt-8 mb-8 bg-gradient-to-br from-[#1E1E1E] to-[#121212] z-20 rounded-2xl overflow-hidden shadow-2xl border-b-4 border-purple-600">
            {/* Tabs Section - Only show for Mac */}
            {isMac && (
                <div className="relative">
                    <div className="flex bg-[#0F0F0F] p-1 rounded-t-2xl">
                        <button
                            ref={descriptionRef}
                            onClick={() => handleTabClick('description')}
                            className={`flex-1 text-lg sm:text-xl font-bold py-4 transition-all duration-300 ${activeTab === 'description'
                                ? 'text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            DESCRIPTION
                        </button>
                        <button
                            ref={installationRef}
                            onClick={() => handleTabClick('installation')}
                            className={`flex-1 text-lg sm:text-xl font-bold py-4 transition-all duration-300 ${activeTab === 'installation'
                                ? 'text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow-lg'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            FIX: INSTALLATION ERROR
                        </button>

                        {/* Animated underline - hidden but kept for functionality */}
                        <div
                            className="absolute -bottom-1 h-0.5 bg-blue-500 transition-all duration-300 opacity-0"
                            style={{
                                left: linePosition,
                                width: lineWidth
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="p-6 sm:p-8">
                {isMac ? (
                    activeTab === 'description' ? (
                        <>
                            <div className="relative">
                                <div className="absolute -top-6 -left-6 w-20 h-20 bg-purple-600 opacity-20 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                                <p
                                    className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed relative z-10"
                                    dangerouslySetInnerHTML={{
                                        __html: showMore
                                            ? (data.description ? data.description.replace(/\\n/g, '<br />') : "No description available.")
                                            : (data.description ? data.description.replace(/\\n/g, '<br />').substring(0, 800) + '...' : "No description available.")
                                    }}
                                />
                            </div>
                            <button
                                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                onClick={toggleShowMore}
                            >
                                {showMore ? "Show Less" : "Show More"}
                            </button>
                        </>
                    ) : (
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-20 h-20 bg-purple-600 opacity-20 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                            <div className="bg-[#0F0F0F] p-6 rounded-xl border border-purple-500/20 shadow-lg relative z-10">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">Installation Fix Instructions</h3>

                                <div
                                    className="text-sm sm:text-base text-gray-200 leading-relaxed mb-6"
                                    dangerouslySetInnerHTML={{
                                        __html: `
                                        <p class="mb-4">Enter the command in terminal: <code class="px-2 py-1 bg-black/50 rounded text-yellow-400 font-mono">xattr -cr</code>
                                        then after it space and then drop the application to the terminal and press Enter.</p>

                                        <p class="mb-4">Or you can disable gatekeeper globally by entering
                                        <code class="px-2 py-1 bg-black/50 rounded text-yellow-400 font-mono">sudo spctl --master-disable</code> in terminal.</p>

                                        <p class="mb-4">Below I have analyzed the most common <span class="text-red-400 font-bold">FIX</span> in this video.</p>
                                    `
                                    }}
                                />

                                <div className="rounded-xl overflow-hidden shadow-xl" style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                                    <iframe
                                        src="https://player.vimeo.com/video/1046166571?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                                        className="border-0"
                                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        title="Fix. The application is damaged and cannot be opened, you should move it to the bin."
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    // Non-Mac content (always show description)
                    <>
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-20 h-20 bg-purple-600 opacity-20 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                    Description
                                </h2>
                                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-purple-600 to-blue-500 rounded-full mt-2"></div>
                            </div>

                            <p
                                className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed relative z-10"
                                dangerouslySetInnerHTML={{
                                    __html: showMore
                                        ? (data.description ? data.description.replace(/\\n/g, '<br />') : "No description available.")
                                        : (data.description ? data.description.replace(/\\n/g, '<br />').substring(0, 800) + '...' : "No description available.")
                                }}
                            />

                            <button
                                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                onClick={toggleShowMore}
                            >
                                {showMore ? "Show Less" : "Show More"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DescriptionTabs;
