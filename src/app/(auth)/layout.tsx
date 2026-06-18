export default function AuthLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">⚽</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-amber-900 font-mono">
            World Cup 2026
          </h1>
          <p className="mt-1 text-sm text-amber-700 font-mono">Bracket Tracker</p>
        </div>
        {children}
      </div>
    </div>
  );
}
