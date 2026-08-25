import { Outlet } from "react-router-dom";
import { Topbar } from "./components/Topbar";
import Footer from "./components/Footer";
import { FloatingContactWidget } from "./components/FloatingContactWidget";
import { FloatingChatbot } from "./components/FloatingChatbot";

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans pt-[72px]">
      <Topbar />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
      <Footer />
      <FloatingContactWidget />
      <FloatingChatbot />
    </div>
  );
}

export default App;
