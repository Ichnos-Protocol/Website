import { Outlet } from "react-router-dom";

export default function SolanaThemeLayout() {
  return (
    <div className="theme-solana">
      <Outlet />
    </div>
  );
}
