// Moved and refactored for dynamic route: /admin/apps/update/[id]/page.jsx
'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

const UpdateApps = () => {
    const router = useRouter();
    const params = useParams();
    const appId = params.id;
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [appData, setAppData] = useState(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [platform, setPlatform] = useState("");
    const [architecture, setArchitecture] = useState("Native");
    const [tags, setTags] = useState([]);
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState("0");
    const [thumbnail, setThumbnail] = useState([]);
    const [downloadLink, setDownloadLinks] = useState(["", "", "", "", "", ""]);
    const [size, setSize] = useState("");
    const [unit, setUnit] = useState('MB');
    const [category, setCategory] = useState("");
    const [coverImg, setCoverImg] = useState("");
    const [systemRequirements, setSystemRequirements] = useState({
        os: "",
        processor: "",
        memory: "",
        graphics: "",
        storage: "",
        additionalNotes: ""
    });
    const [gameMode, setGameMode] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [showTagSelector, setShowTagSelector] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserData(decoded);
                    if (decoded.role === 'ADMIN') {
                        setIsAdmin(true);
                    } else {
                        toast.error('Unauthorized access. Redirecting to home page...');
                        setTimeout(() => router.push('/'), 2000);
                    }
                } catch (err) {
                    setUserData(null);
                    router.push('/');
                }
            } else {
                setUserData(null);
                toast.error('Unauthorized access. Redirecting to home page...');
                setTimeout(() => router.push('/'), 2000);
            }
        }
    }, [router]);

    // Fetch app data by ID from route param
    useEffect(() => {
        if (isAdmin && appId) {
            const fetchApp = async () => {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://toxicgames.in';
                    const { data } = await axios.get(`${apiUrl}/api/apps/get/${appId}`
                        , {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${token}`,
                                'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                            }
                        }
                    );
                    const app = data.app;
                    setAppData(app);
                    setTitle(app.title || "");
                    setDescription(app.description || "");
                    setPlatform(app.platform || "");
                    setArchitecture(app.architecture || "Native");
                    setTags(app.tags || []);
                    setIsPaid(app.isPaid || false);
                    setPrice(app.price ? String(app.price) : "0");
                    setDownloadLinks(app.downloadLink || ["", "", "", "", "", ""]);
                    setSize(app.size ? app.size.split(' ')[0] : "");
                    setUnit(app.size && app.size.includes('GB') ? 'GB' : 'MB');
                    setCategory(app.category?.name || app.category || "");
                    setSystemRequirements(app.systemRequirements || {
                        os: "",
                        processor: "",
                        memory: "",
                        graphics: "",
                        storage: "",
                        additionalNotes: ""
                    });
                    setGameMode(app.gameMode || "");
                    setReleaseYear(app.releaseYear ? String(app.releaseYear) : "");
                    setCoverImg(app.coverImg || "");
                    setThumbnail(Array.isArray(app.thumbnail) ? app.thumbnail : (app.thumbnail ? [app.thumbnail] : []));
                } catch (err) {
                    toast.error('Failed to fetch app data.');
                    router.push('/');
                } finally {
                    setLoading(false);
                }
            };
            fetchApp();
        }
    }, [isAdmin, appId, router]);

    const handleDownloadLinkChange = (index, value) => {
        const newLinks = [...downloadLink];
        newLinks[index] = value;
        setDownloadLinks(newLinks);
    };

    const handleSystemRequirementChange = (field, value) => {
        setSystemRequirements(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleTag = (tag) => {
        setTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                if (prev.length >= 15) {
                    toast.error("Maximum 15 tags allowed!");
                    return prev;
                }
                return [...prev, tag];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        let decoded = null;
        if (token) {
            try {
                decoded = jwtDecode(token);
            } catch (err) {
                toast.error('Invalid token. Please login again.');
                setLoading(false);
                router.push('/');
                return;
            }
        }
        if (!decoded || decoded.role !== 'ADMIN') {
            toast.error('Unauthorized access. Only admins can update apps.');
            setTimeout(() => router.push('/'), 2000);
            setLoading(false);
            return;
        }
        const filteredDownloadLink = downloadLink.filter(link => link.trim() !== "");
        if (filteredDownloadLink.length === 0) {
            toast.error("Please provide at least one download link!");
            setLoading(false);
            return;
        }
        if (tags.length === 0) {
            toast.error("Please select at least one tag!");
            setLoading(false);
            return;
        }
        // Prepare payload for URL-based images
        const payload = {
            title,
            description,
            platform,
            architecture,
            tags,
            isPaid,
            price: String(price),
            size: `${size} ${unit}`,
            category,
            gameMode,
            releaseYear: String(releaseYear),
            systemRequirements,
            coverImg,
            thumbnail,
            downloadLink: filteredDownloadLink,
        };
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://toxicgames.in';
            await axios.put(`${apiUrl}/api/apps/edit/${appId}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
            });
            toast.success("🎉 App updated successfully!");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast.error("❌ Error updating app! " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Predefined options (copied from createApps.jsx)
    const predefinedTags = [
        "2D", "3D", "Action", "Adventure", "Agriculture", "Anime", "Apps", "Arcade",
        "Artificial Intelligence", "Assassin", "Atmospheric", "Automation", "Blood",
        "Building", "Cartoon", "Casual", "Character Customization", "Cinematic", "Classic",
        "Co-Op", "Colony Sim", "Colorful", "Combat", "Comedy", "Comic Book", "Competitive",
        "Controller", "Crafting", "Crime", "Cute", "Cyberpunk", "Dark Humor", "Difficult",
        "Dragons", "Driving", "Early Access", "eSport", "Exploration", "Family Friendly",
        "Fantasy", "Farming Sim", "Fast-Paced", "Female Protagonist", "Fighting",
        "First-Person", "Fishing", "Flight", "FPS", "Funny", "Gore", "Great Soundtrack",
        "Hack and Slash", "History", "Horror", "Hunting", "Idler", "Illuminati",
        "Immersive Sim", "Indie", "LEGO", "Life Sim", "Loot", "Management", "Mature",
        "Memes", "Military", "Modern", "Multiplayer", "Mystery", "Nudity", "Open World",
        "Parkour", "Physics", "Pixel Graphics", "Post-apocalyptic", "Puzzle", "PvP",
        "Racing", "Realistic", "Relaxing", "Resource Management", "RPG", "Sandbox",
        "Sci-fi", "Science", "Science Fiction", "Sexual Content", "Shooters", "Simulation",
        "Singleplayer", "Sports", "Stealth Game", "Story Rich", "Strategy", "Superhero",
        "Surreal", "Survival", "Tactical", "Tanks", "Team-Based", "Third Person",
        "Third-Person-Shooter", "Thriller", "Tower Defense", "Trading", "Turn-Based",
        "Underwater", "Utilities", "Violent", "VR", "War", "Wargame", "Zombie"
    ];
    const categories = [
        { value: "pc", label: "PC Games" },
        { value: "spc", label: "PC Softwares" },
        { value: "mac", label: "Mac Games" },
        { value: "smac", label: "Mac Softwares" },
        { value: "android", label: "Android Games" },
        { value: "sandroid", label: "Android Softwares" },
        { value: "ppsspp", label: "PPSSPP Iso" },
        { value: "ps2", label: "PS2 Iso" },
        { value: "ps3", label: "PS3 Iso" },
        { value: "ps4", label: "Mac Exclusive Games" },
    ];
    const architectures = ["Native", "ARM", "Wineskin", "Port"];
    const gameModes = ["Singleplayer", "Multiplayer"];
    const platforms = ["PC", "Mac", "Android", "Playstation"];
    const downloadLinkLabelsAndPlaceholders = [
        { label: "Viking File (Mac) // VikingFile (PC)", placeholder: "Enter the VikingFile link" },
        { label: "OneDrive (Mac) // Buzzheavier (PC)", placeholder: "Enter the Buzzheavier link" },
        { label: "Torrent (Mac) // FuckingFast (PC)", placeholder: "Enter the Torrent link" },
        { label: "BuzzHeavier (Mac) // Bzzhr.co (PC)", placeholder: "Enter other download link" },
        { label: "MediaFire Link (Mac) // Buzzheavier (PC)", placeholder: "Enter Mediafire link" },
        { label: "Akira Box Link (Mac, PC)", placeholder: "Enter AkiraBox link" }
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
            <ToastContainer position="bottom-right" theme="dark" />
            <div className="max-w-5xl mx-auto">
                {isAdmin ? (
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-8 bg-gradient-to-br from-gray-800/50 to-gray-900/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl ring-1 ring-purple-500/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header Section */}
                        <div className="border-b border-purple-500/30 pb-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Update Game/App
                                </h1>
                            </div>
                            <p className="text-gray-400">Edit your app details below</p>
                        </div>
                        {/* Main Form Content */}
                        {/* Title, Description, and Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the app title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="category">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="description">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="Enter a brief description of the app"
                                rows="4"
                                required
                            />
                        </div>
                        {/* Tags Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="tags">
                                Tags <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="tags"
                                multiple
                                value={tags}
                                onChange={e => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setTags(selected);
                                }}
                                className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none h-40"
                                required
                            >
                                {predefinedTags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-gray-400">
                                Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags. Maximum 15 tags allowed.
                            </p>
                        </div>
                        {/* Paid Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="isPaid">
                                Paid App?
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPaid(true)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                                    ${isPaid ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                                    `}
                                >
                                    Yes
                                    {isPaid && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPaid(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
                                    ${!isPaid ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                                    `}
                                >
                                    No
                                    {!isPaid && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        {isPaid && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="price">
                                    Price (in USD) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the app price"
                                    required
                                />
                            </div>
                        )}
                        {/* File Uploads and Download Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="coverImg">
                                    Cover Image URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="coverImg"
                                    value={coverImg}
                                    onChange={e => setCoverImg(e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Paste cover image URL here"
                                    required
                                />
                                {coverImg && (
                                    <img src={coverImg} alt="Cover Preview" className="mt-2 rounded-lg max-h-40" />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="thumbnail">
                                    Thumbnail URLs (comma separated) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="thumbnail"
                                    value={Array.isArray(thumbnail) ? thumbnail.join(',') : thumbnail}
                                    onChange={e => setThumbnail(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Paste thumbnail image URLs, separated by commas"
                                    rows={3}
                                    required
                                />
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {Array.isArray(thumbnail) && thumbnail.map((url, idx) => url && (
                                        <img key={idx} src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-auto rounded-md" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="downloadLinks">
                                Download Links <span className="text-red-500">*</span>
                            </label>
                            {downloadLink.map((link, index) => (
                                <div key={index} className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={(e) => handleDownloadLinkChange(index, e.target.value)}
                                        className="flex-1 p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                        placeholder={`Enter download link ${index + 1}`}
                                        required
                                    />
                                    {index === downloadLink.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (downloadLink.length < 6) {
                                                    setDownloadLinks([...downloadLink, ""]);
                                                } else {
                                                    toast.error("Maximum 6 download links allowed!");
                                                }
                                            }}
                                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-500 text-white transition-all hover:bg-purple-600"
                                        >
                                            Add Another Link
                                        </button>
                                    )}
                                </div>
                            ))}
                            <p className="mt-2 text-xs text-gray-400">
                                You can provide up to 6 download links. Leave blank if not applicable.
                            </p>
                        </div>
                        {/* System Requirements and Game Mode */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="os">
                                    Operating System <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="os"
                                    value={systemRequirements.os}
                                    onChange={(e) => handleSystemRequirementChange('os', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the required operating system"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="processor">
                                    Processor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="processor"
                                    value={systemRequirements.processor}
                                    onChange={(e) => handleSystemRequirementChange('processor', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the required processor"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="memory">
                                    Memory (RAM) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="memory"
                                    value={systemRequirements.memory}
                                    onChange={(e) => handleSystemRequirementChange('memory', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the required memory (e.g., 8GB)"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="graphics">
                                    Graphics Card <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="graphics"
                                    value={systemRequirements.graphics}
                                    onChange={(e) => handleSystemRequirementChange('graphics', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the required graphics card"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="storage">
                                    Storage Space <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="storage"
                                    value={systemRequirements.storage}
                                    onChange={(e) => handleSystemRequirementChange('storage', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter the required storage space"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="additionalNotes">
                                    Additional Notes
                                </label>
                                <textarea
                                    id="additionalNotes"
                                    value={systemRequirements.additionalNotes}
                                    onChange={(e) => handleSystemRequirementChange('additionalNotes', e.target.value)}
                                    className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="Enter any additional system requirements"
                                    rows="2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="gameMode">
                                Game Mode <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gameMode"
                                value={gameMode}
                                onChange={(e) => setGameMode(e.target.value)}
                                className="block w-full p-3 text-gray-900 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                required
                            >
                                <option value="">Select a game mode</option>
                                {gameModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full px-6 py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 transition-all hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    "Update App"
                                )}
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-200 mb-4">
                            Access Denied
                        </h2>
                        <p className="text-gray-400">
                            You do not have permission to view this page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateApps;
