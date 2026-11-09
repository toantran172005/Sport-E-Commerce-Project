import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChatbotProvider } from '../context/ChatbotContext';
import { ChatbotLauncher, ChatbotPanel } from '../components/chatbot';

export default function ClientLayout() {
  const [launcherPosition, setLauncherPosition] = useState(null);

  return (
    <ChatbotProvider>
      <div className="min-h-screen flex flex-col bg-page text-ink transition-colors duration-200 relative">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ChatbotLauncher onPositionChange={setLauncherPosition} />
        <ChatbotPanel launcherPosition={launcherPosition} />
      </div>
    </ChatbotProvider>
  );
}
