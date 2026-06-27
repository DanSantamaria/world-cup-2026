export function Footer(): React.ReactElement {
  return (
    <footer className="bg-gold-dark mt-auto py-5 px-4 text-center">
      <p className="text-white/70 text-xs">
        © {new Date().getFullYear()} Scores Cup · Made by Daniel Santamaria
      </p>
    </footer>
  );
}
