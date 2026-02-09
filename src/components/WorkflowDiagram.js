import React from "react";

export default function WorkflowDiagram() {
  const steps = [
    {
      number: 1,
      icon: "🔍",
      title: "Enter URL",
      description: "Paste radio station playlist link",
      gradient: "from-gray-300 to-gray-400",
      actor: "you",
    },
    {
      number: 2,
      icon: "📡",
      title: "Fetch Playlist",
      description: "Retrieve songs from website",
      gradient: "from-gray-400 to-gray-500",
      actor: "auto",
    },
    {
      number: 3,
      icon: "🎵",
      title: "Extract Songs",
      description: "Identify playlist tracks",
      gradient: "from-gray-500 to-gray-600",
      actor: "auto",
    },
    {
      number: 4,
      icon: "🔎",
      title: "Search YouTube",
      description: "Find matching videos",
      gradient: "from-slate-400 to-slate-500",
      actor: "auto",
    },
    {
      number: 5,
      icon: "➕",
      title: "Create Playlist",
      description: "Build YouTube collection",
      gradient: "from-slate-500 to-slate-600",
      actor: "auto",
    },
    {
      number: 6,
      icon: "✅",
      title: "Saved",
      description: "Playlist in your account",
      gradient: "from-slate-600 to-slate-700",
      actor: "auto",
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop: Horizontal Layout */}
      <div className="hidden md:flex items-start justify-between space-x-4">
        {/* Step 1 - Outside the box */}
        <div className="flex-1 flex flex-col items-center text-center pt-10">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${steps[0].gradient} flex items-center justify-center text-4xl shadow-xl shadow-black/20 mb-3 transform hover:scale-110 transition-transform duration-200 border border-gray-400`}>
            {steps[0].icon}
          </div>
          <div className="text-xs font-bold text-gray-600 mb-1 tracking-wider">
            STEP {steps[0].number}
          </div>
          <div className="font-semibold text-gray-800 mb-1">
            {steps[0].title}
          </div>
          <div className="text-sm text-gray-600">
            {steps[0].description}
          </div>
        </div>

        {/* Arrow after step 1 */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ marginTop: '58px' }}>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Steps 2-6 inside Bihag box */}
        <div className="flex-[5] relative border-3 border-[#b91c1c] rounded-2xl p-6 pt-10 bg-[#b91c1c]/10" style={{ borderWidth: '3px' }}>
          {/* Bihag label on top */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 border-3 border-[#b91c1c] rounded-lg" style={{ borderWidth: '3px' }}>
            <span className="text-[#b91c1c] font-display font-bold text-sm tracking-wider">BIHAG</span>
          </div>

          <div className="flex items-start justify-between space-x-3">
            {steps.slice(1).map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-4xl shadow-xl shadow-black/20 mb-3 transform hover:scale-110 transition-transform duration-200 border border-gray-400`}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-bold text-gray-600 mb-1 tracking-wider">
                    STEP {step.number}
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {step.description}
                  </div>
                </div>

                {/* Arrow between steps inside box */}
                {index < steps.slice(1).length - 1 && (
                  <div className="flex items-center justify-center flex-shrink-0 pt-8">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="md:hidden space-y-4">
        {/* Step 1 */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${steps[0].gradient} flex items-center justify-center text-3xl shadow-lg shadow-black/20 border border-gray-400`}>
              {steps[0].icon}
            </div>
          </div>
          <div className="flex-1 pt-2">
            <div className="text-xs font-bold text-gray-600 mb-1 tracking-wider">
              STEP {steps[0].number}
            </div>
            <div className="font-semibold text-gray-800 mb-1">
              {steps[0].title}
            </div>
            <div className="text-sm text-gray-600">
              {steps[0].description}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Steps 2-6 in Bihag box */}
        <div className="relative rounded-2xl p-4 pt-8 bg-[#b91c1c]/10 space-y-4" style={{ borderWidth: '3px', borderColor: '#b91c1c', borderStyle: 'solid' }}>
          {/* Bihag label */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg" style={{ borderWidth: '3px', borderColor: '#b91c1c', borderStyle: 'solid' }}>
            <span className="text-[#b91c1c] font-display font-bold text-xs tracking-wider">BIHAG</span>
          </div>

          {steps.slice(1).map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-3xl shadow-lg shadow-black/40 border border-slate-600/40`}>
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="text-xs font-bold text-gray-600 mb-1 tracking-wider">
                    STEP {step.number}
                  </div>
                  <div className="font-semibold text-gray-800 mb-1">
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Arrow between steps inside box */}
              {index < steps.slice(1).length - 1 && (
                <div className="flex justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
