export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-gentle w-full" style={{ animationFillMode: 'both' }}>
      {children}
    </div>
  );
}
