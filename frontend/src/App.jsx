import { Outlet, useLocation } from "react-router-dom";
import { Topbar } from "./components/Topbar";
import Footer from "./components/Footer";
import { FloatingContactWidget } from "./components/FloatingContactWidget";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { ChatWidget } from "./components/ChatWidget";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col font-sans pt-[72px]">
      <Topbar />
      <main className="flex-1 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingContactWidget />
      <FloatingChatbot />
      <ChatWidget />
    </div>
  );
}

export default App;
