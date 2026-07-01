"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="h-[3px] bg-[#E8272C] w-12 mx-auto mb-8" />
        <h1 className="text-2xl font-bold text-[#0A2540] mb-3">
          You&apos;re offline
        </h1>
        <p className="text-sm text-[#5A6B7F] leading-relaxed">
          SRC Advisory requires a connection to load reports and analysis.
          Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2.5 bg-[#0A2540] text-white text-sm font-semibold rounded-sm hover:bg-[#0A2540]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
