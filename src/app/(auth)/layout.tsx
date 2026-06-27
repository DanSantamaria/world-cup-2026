export default function AuthLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 py-10">
      {/* Logo — same treatment as groups page */}
      <div className="mb-8">
        <img
          src="/scores-cup-logo.svg"
          alt="Scores Cup 26"
          className="h-24 w-auto"
          draggable={false}
        />
      </div>

      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
