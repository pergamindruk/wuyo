import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import ChatBotLoader from "@/components/ChatBotLoader";
import { MobileContactBar } from "@/components/MobileContactBar";
import { SkipLink } from "@/components/SkipLink";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <SkipLink label="Przejdź do treści" />
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <MobileContactBar />
            <ScrollToTop />
            <ChatBotLoader />
        </div>
    );
}
