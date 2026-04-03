import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import ChatBotLoader from "@/components/ChatBotLoader";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
            <ChatBotLoader />
        </div>
    );
}
