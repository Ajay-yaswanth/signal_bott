import { RiskDisclaimer } from "@/components/trading/risk-disclaimer";

export function PageLoading() {
  return (
    <main
      className="min-h-screen bg-background px-4 py-6 text-foreground terminal-grid sm:px-6 lg:px-8"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-7xl animate-pulse">
        <div className="h-5 w-28 rounded bg-primary/15" />
        <div className="mt-4 h-9 w-full max-w-sm rounded bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-white/[0.07]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-28 rounded-lg border border-white/10 bg-white/[0.04]"
            />
          ))}
        </div>
        <div className="mt-4 h-96 rounded-lg border border-white/10 bg-white/[0.04]" />
        <div className="mt-8">
          <RiskDisclaimer />
        </div>
      </div>
    </main>
  );
}
