'use client';

import React, { useState, useEffect } from 'react';

export default function DonatePage() {
  const [fundingData, setFundingData] = useState({
    rdr2: 950,
    macbook: 0,
    monthly: 0,
    total: 0
  });

  const [goals] = useState({
    rdr2: 1200,
    macbook: 2000,
    monthly: 100
  });

  const [daysRemaining, setDaysRemaining] = useState(7);
  const [showThankYou, setShowThankYou] = useState(false);

  // Calculate percentages
  const rdr2Percentage = Math.min((fundingData.rdr2 / goals.rdr2) * 100, 100);
  const macbookPercentage = Math.min((fundingData.macbook / goals.macbook) * 100, 100);
  const monthlyPercentage = Math.min((fundingData.monthly / goals.monthly) * 100, 100);

  // Calculate daily amount needed
  const dailyNeeded = daysRemaining > 0
    ? ((goals.monthly - fundingData.monthly) / daysRemaining).toFixed(2)
    : 0;

  // Donation allocation data
  const allocationData = [
    { percentage: 60, label: "Storage Costs", color: "#4e54c8" },
    { percentage: 25, label: "Server Costs", color: "#00b09b" },
    { percentage: 15, label: "Miscellaneous", color: "#ff8000" }
  ];

  // Calculate conic gradient for pie chart
  const conicGradient = allocationData.reduce((acc, item, index) => {
    const start = index === 0 ? 0 :
      allocationData.slice(0, index).reduce((sum, i) => sum + i.percentage, 0);
    const end = start + item.percentage;
    return `${acc} ${item.color} ${start}% ${end}%,`;
  }, '').slice(0, -1);

  // Handle Ko-fi donation button click
  const handleKofiClick = () => {
    window.open('https://ko-fi.com/toxicgames', '_blank');
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 5000);
  };

  // Fetch data from Sheety API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.sheety.co/93ba89c95aaf4b9825dab4755b23175d/toxicgamesGoal/sheet1');
        const data = await response.json();

        if (data.sheet1 && data.sheet1.length > 0) {
          const sheetData = data.sheet1[0];
          setFundingData({
            rdr2: sheetData.rdr2 || 0,
            macbook: sheetData.macbook || 0,
            monthly: sheetData.monthly || 0,
            total: sheetData.total || 0
          });
        }
      } catch (error) {
        console.error('Error fetching data from Sheety:', error);
      }
    };

    fetchData();

    // Calculate days remaining in the month
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysLeft = lastDay.getDate() - today.getDate();
    setDaysRemaining(daysLeft);
  }, []);

  // Circular progress component
  const CircularProgress = ({ percentage, title, current, goal, color, size = 20 }) => (
    <div className="flex flex-col items-center">
      <div className={`relative w-${size} h-${size}`}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2D3748"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-red-400">${current}</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm text-blue-400 font-medium">{title}</div>
        <div className="text-sm text-gray-400">{Math.round(percentage)}% of ${goal}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {/* Thank You Toast */}
      {showThankYou && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn">
          Thank you for your donation!
        </div>
      )}

      {/* Become a Member Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 mb-12 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Become a Premium Member!</h2>
          <p className="text-white/90 mb-4 max-w-2xl mx-auto">
            Unlock exclusive benefits, early access to new releases, and ad-free experience
          </p>
          <a
            href="/membership"
            className="inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Membership Benefits
          </a>
        </div>
      </div>

      {/* Project Support Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Support the Project</h1>
        <div className="p-8 rounded-2xl border-2 border-dashed border-indigo-500/30 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] shadow-2xl">
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <img
              className="w-full h-auto"
              src="https://i.postimg.cc/8CKCtDWs/4y35ygtayile1.png"
              alt="Project Banner"
            />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-xl font-bold text-white">For Public Release</h2>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-white">Raised: <span className="text-green-400">₹{fundingData.rdr2.toLocaleString()}</span></span>
              <span className="font-medium text-white">Goal: <span className="text-blue-400">₹{goals.rdr2.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-5 p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500 relative"
                style={{ width: `${rdr2Percentage}%` }}
              >
                {rdr2Percentage > 10 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {Math.round(rdr2Percentage)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-300 mb-6">
            We're working hard to bring you an amazing gaming experience.
            Your support helps us make it even better!
          </p>
          <div className="animate-pulse text-indigo-400 font-medium">
            You can request programs and games in the request section.
          </div>
        </div>
      </section>

      {/* Donation Options Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Support Our Development
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ko-fi Section - Replaces Buy Me a Coffee */}
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-8 rounded-2xl shadow-xl border border-blue-500/30 transform transition-all duration-300 hover:shadow-blue-500/10">
            {/* ... existing content ... */}

            {/* Funding Goals Section - UPDATED */}
            <div className="mt-2">
              <h4 className="text-3xl font-semibold text-center mb-6 text-blue-300">
                Monthly Funding Progress
              </h4>
              <p className="text-gray-400 text-md text-center mb-8">
                Support our ongoing battle against the industry. Every contribution gets us closer to our goal.
              </p>

              {/* Goals Container - UPDATED */}
              <div className="flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-14 mb-8">
                  {/* Monthly Goal - UPDATED */}
                  <CircularProgress
                    percentage={monthlyPercentage}
                    title="Monthly"
                    current={fundingData.monthly}
                    goal={goals.monthly}
                    color="#6366F1"
                    size={48} // Increased size
                  />

                  {/* Macbook Goal - UPDATED */}
                  <CircularProgress
                    percentage={macbookPercentage}
                    title="New Mac: M4"
                    current={fundingData.macbook}
                    goal={goals.macbook}
                    color="#10B981"
                    size={48} // Increased size
                  />
                </div>

                <div className="w-full max-w-md bg-blue-900/30 p-5 rounded-xl border border-blue-500/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">${fundingData.monthly}</div>
                    <div className="text-base text-gray-300 mt-2">
                      {Math.round(monthlyPercentage)}% of ${goals.monthly}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      {daysRemaining} days remaining
                    </div>
                    <div className="text-base text-blue-400 font-medium mt-2">
                      ${dailyNeeded}/day needed to reach goal
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-base text-gray-500 text-center">
                New Macbook: So we can test and add more AAA free games for you
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center mt-6 gap-3">
              <div className="text-xs bg-blue-900/30 px-3 py-1 rounded-full text-blue-300 border border-blue-500/20">
                Quick & Easy
              </div>
              <div className="text-xs bg-blue-900/30 px-3 py-1 rounded-full text-blue-300 border border-blue-500/20">
                Multiple Payment Options
              </div>
              <div className="text-xs bg-blue-900/30 px-3 py-1 rounded-full text-blue-300 border border-blue-500/20">
                Leave a Message
              </div>
            </div>
          </div>

          {/* Donation Allocation Visualization */}
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-8 rounded-2xl shadow-xl border border-indigo-500/30">
            <h3 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              How Your Donation Helps
            </h3>

            <div className="flex flex-col items-center justify-center">
              {/* 2D Pie Chart */}
              <div className="relative w-64 h-64 mb-8 rounded-full overflow-hidden shadow-lg"
                style={{
                  background: `conic-gradient(${conicGradient})`
                }}
              >
                <div className="absolute inset-4 bg-[#0f0f1a] rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white"> Cost %</div>
                    <div className="text-gray-300 text-sm">where your donation goes</div>
                  </div>
                </div>
              </div>

              {/* Allocation Details */}
              <div className="w-full space-y-4">
                {allocationData.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/50 hover:border-indigo-500"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-white flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        {item.label}
                      </h3>
                      <span className="font-bold text-lg text-white px-3 py-1 rounded-full">
                        {item.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {item.label === "Storage Costs" && "Ensures we can host all game files and updates"}
                      {item.label === "Server Costs" && "Keeps our servers running for smooth downloads"}
                      {item.label === "Miscellaneous" && "Renewals, maintenance, and community support"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          Other Donation Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* UPI Card */}
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-6 rounded-2xl shadow-xl border border-purple-500/20 text-center transform transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">UPI Payment</h3>
            <p className="text-gray-300 mb-4">
              PhonePe, Paytm, Google Pay, etc.
            </p>

            <div className="mt-4">
              <div className="border border-purple-500/20 rounded-xl p-5 bg-black/30 backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  <div className="bg-white border-4 border-purple-500/20 rounded-xl shadow-lg overflow-hidden">
                    <img
                      src="https://i.postimg.cc/zD71FFgv/Screenshot-2025-03-26-at-1-33-37-AM.png"
                      alt="Telegram QR Code"
                      className="w-40 h-40 object-cover"
                    />
                  </div>
                </div>
                <div className="bg-black/50 p-3 rounded-lg text-sm font-mono text-center text-gray-300 border border-blue-500/20">
                  <span className="text-blue-400 font-semibold">Telegram:</span> DM for UPI details
                </div>
              </div>
            </div>
          </div>

          {/* Crypto Card */}
          <div className="bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] p-6 rounded-2xl shadow-xl border border-indigo-500/20 text-center transform transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Crypto Donations</h3>
            <p className="text-gray-300 mb-4">
              Support us with cryptocurrency
            </p>

            <div className="mt-4">
              <div className="border border-indigo-500/20 rounded-xl p-5 bg-black/30 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-red-500/20">
                    <h4 className="font-medium text-red-400 mb-2">USDT (TRC20)</h4>
                    <div className="text-xs break-all font-mono text-gray-300">
                      TFq2xVb7ibR7q5Mb1pkWiiCT34BmS3y2gi
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-400 mb-2">USDT (BSC)</h4>
                    <div className="text-xs break-all font-mono text-gray-300">
                      0x291dce3bd01fceec0665b9d6b9734946e335954b
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-orange-500/20">
                    <h4 className="font-medium text-orange-400 mb-2">BTC</h4>
                    <div className="text-xs break-all font-mono text-gray-300">
                      1DLfx6a4CU7G9Abj9fedxpdY21srPPstbX
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium text-purple-400 mb-2">ETH</h4>
                    <div className="text-xs break-all font-mono text-gray-300">
                      0x291dce3bd01fceec0665b9d6b9734946e335954b
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Coming Soon...</h1>
        <div className="p-8 rounded-2xl border-2 border-dashed border-red-500/30 bg-gradient-to-br from-[#1a1a1a] to-[#2a0f0f] shadow-lg relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-600/20 rounded-full blur-xl"></div>

          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl border border-red-500/20">
            <img
              className="w-full h-auto"
              src="https://i.postimg.cc/WzF6znR8/God-of-war-ragnarok-banner-black-background-2-817x320.jpg"
              alt="God of War Ragnarok"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-3">Ragnarok is Coming</h2>
          </div>

          <div className="animate-pulse text-red-400 font-medium p-3 bg-black/30 rounded-lg border border-red-500/20">
            After the completion of Red Dead Redemption 2, then the other games will be posted.
          </div>

          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 rounded-full shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-white">COMING SOON</span>
          </div>
        </div>
      </section>
    </div>
  );
}