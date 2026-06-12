import "./vindi.css";

export default function VindiLayout({ children }: { children: React.ReactNode }) {
  return <div className="vindi-root">{children}</div>;
}
