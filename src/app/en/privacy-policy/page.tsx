import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { alternatesFor, route } from "@/lib/i18n";

// Tłumaczenie 1:1 polskiej /polityka-prywatnosci. Wiążąca jest wersja polska.
// Zmiana w polskiej = zmiana tutaj.

export const metadata: Metadata = {
    title: "Privacy policy",
    description: "How personal data and cookies are handled on the WUYO website and how your privacy is protected.",
    alternates: alternatesFor("privacy", "en"),
};

export default function PrivacyPolicyEnPage() {
    return (
        <div className="flex-1 w-full bg-navy-dark pt-40 md:pt-48 pb-24 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                <AnimatedSection>
                    <Link href={route("home", "en")} className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-12 font-medium">
                        <ArrowLeft size={20} /> Back to home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Privacy policy.</h1>
                    <p className="text-white/60 text-lg max-w-2xl mb-4">
                        The full, formal information on how I look after your data. No catches, just straightforward business.
                    </p>
                    <p className="text-white/45 text-sm max-w-2xl mb-16">
                        This is a translation for convenience. The <Link href={route("privacy", "pl")} hrefLang="pl" className="text-gold hover:underline">Polish version</Link> is legally binding.
                    </p>
                </AnimatedSection>

                <div className="space-y-12 text-white/70 prose prose-invert prose-p:leading-relaxed prose-a:text-gold hover:prose-a:text-white max-w-none">
                    <AnimatedSection delay={0.1}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 1 General information</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>This policy applies to the website operating at the operator&apos;s web address.</li>
                            <li>The operator of the website and the controller of personal data is <strong>Wuyo</strong>.</li>
                            <li>The operator&apos;s contact email: <strong>kontakt@wuyo.pl</strong>.</li>
                            <li>The operator is the controller of your personal data provided voluntarily on the website.</li>
                            <li>The website uses personal data for the following purposes:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>handling enquiries sent through the contact form or by email,</li>
                                    <li>delivering ordered services,</li>
                                    <li>presenting the offer or information.</li>
                                </ul>
                            </li>
                            <li>The website collects information about users and their behaviour in the following ways:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Through data entered voluntarily, which is entered into the operator&apos;s systems.</li>
                                    <li>By storing cookie files on end devices.</li>
                                </ul>
                            </li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 2 Selected data protection methods used by the operator</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Places where you log in (if applicable) or enter personal data are protected at the transmission layer (SSL certificate). Personal and login data entered on the site are encrypted on the user&apos;s computer and can only be read on the target server.</li>
                            <li>To protect data, the operator makes regular backups.</li>
                            <li>An important part of data protection is regularly updating all software the operator uses to process personal data.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.3}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 3 Who processes your data on my behalf</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>To run the Website I use companies that process data on my behalf (Art. 28 GDPR). They process data only on my instructions and only as needed to provide their service:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Vercel Inc.</strong> (USA): website hosting. All data sent through the website passes through its servers, including form content. Vercel also collects anonymous visit and performance statistics (Vercel Analytics, Speed Insights) without cookies.</li>
                                    <li><strong>Supabase Inc.</strong> (servers in Ireland, EU): the database where I store enquiries from forms and the chat, and anonymous data on visited pages.</li>
                                    <li><strong>Resend</strong> (Plus Five Five Inc., USA): sending emails from the Website, i.e. notifications about your enquiry and confirmations sent to your address.</li>
                                    <li><strong>Google</strong> (Gemini API): the chat on the website. Messages you type in the chat are sent to Google, which generates the reply. I use the free version of this service, so Google may use chat content to improve its services, and Google staff may review it. For that purpose Google acts as a separate controller under its own privacy policy (policies.google.com/privacy). Do not enter personal data beyond what is needed to contact you, and no sensitive data. If you prefer, email kontakt@wuyo.pl or use the contact form.</li>
                                    <li><strong>Google Ireland Limited</strong> and <strong>Meta Platforms Ireland Limited</strong>: statistics and ad measurement, only with your consent (see § 5).</li>
                                </ul>
                            </li>
                            <li>Some of these companies are based or have servers in the USA. Data is transferred outside the European Economic Area under the European Commission decision on the EU-U.S. Data Privacy Framework (Art. 45 GDPR) or under standard contractual clauses approved by the European Commission (Art. 46 GDPR).</li>
                            <li>Your data may also be disclosed to public authorities where the law requires it, and invoice data to an accounting office.</li>
                            <li>I never sell your data.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 4 Legal bases, retention and your rights</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Legal bases for processing:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>answering your enquiry and preparing a quote: steps taken at your request before entering into a contract (Art. 6(1)(b) GDPR),</li>
                                    <li>providing the ordered service: performance of a contract (Art. 6(1)(b) GDPR),</li>
                                    <li>issuing invoices and keeping accounts: legal obligation (Art. 6(1)(c) GDPR),</li>
                                    <li>establishing or defending legal claims and anonymous website statistics: legitimate interest of the Controller (Art. 6(1)(f) GDPR),</li>
                                    <li>analytics and marketing cookies: your consent (Art. 6(1)(a) GDPR).</li>
                                </ul>
                            </li>
                            <li>How long I keep data:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>enquiries that did not lead to cooperation: up to 12 months from the last contact,</li>
                                    <li>client data: for the duration of cooperation, then until claims become time-barred,</li>
                                    <li>invoices and accounting records: 5 years from the end of the year in which the tax payment deadline passed,</li>
                                    <li>cookie data: until you withdraw consent or the cookie expires.</li>
                                </ul>
                            </li>
                            <li>You have the right to request from the Controller:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>access to your personal data,</li>
                                    <li>rectification, erasure or restriction of processing,</li>
                                    <li>data portability,</li>
                                    <li>objection to processing based on legitimate interest,</li>
                                    <li>withdrawal of consent at any time, without affecting the lawfulness of processing before withdrawal.</li>
                                </ul>
                            </li>
                            <li>To exercise your rights, write to <strong>kontakt@wuyo.pl</strong>.</li>
                            <li>You have the right to lodge a complaint with the President of the Personal Data Protection Office (Prezes UODO, ul. Stawki 2, 00-193 Warsaw, Poland).</li>
                            <li>Your data is not used for automated decision-making, including profiling, that produces legal effects concerning you.</li>
                            <li>Providing personal data is voluntary but necessary to handle your enquiry and provide the service.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.5}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 5 Cookies</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>The website uses cookies.</li>
                            <li>Cookies are IT data, in particular text files, stored on the user&apos;s end device and intended for using the website.</li>
                            <li>The entity placing cookies on the user&apos;s end device and accessing them is the website operator.</li>
                            <li>Cookies are used for statistical purposes, for the website to work correctly and for technical purposes.</li>
                            <li>Web browsers usually allow cookies to be stored on the user&apos;s device by default. Users can change these settings or manage cookies directly in their browser settings.</li>
                            <li>
                                The website uses external tools that store their own cookies:
                                <ul className="list-disc pl-5 mt-2 space-y-2">
                                    <li><strong>Google Analytics 4</strong> (Google Ireland Limited): traffic statistics such as number of visits, traffic sources, pages viewed, forms sent and contact clicks. Analytics cookies.</li>
                                    <li><strong>Meta Pixel</strong> (Meta Platforms Ireland Limited): measuring the effectiveness of ads on Facebook and Instagram. Marketing cookies.</li>
                                </ul>
                                Both tools may transfer data to the United States on the basis of the European Commission adequacy decision (EU–US Data Privacy Framework).
                            </li>
                            <li>Analytics and marketing cookies only run after you give consent in the banner shown on your first visit. Until then they are blocked; the website uses Google Consent Mode v2. Cookies necessary for the website to work do not require consent.</li>
                            <li>You can change or withdraw your consent at any time by clicking <strong>&quot;Cookie settings&quot;</strong> in the website footer. Withdrawing consent does not affect the lawfulness of processing carried out before it was withdrawn.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.6}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 6 Final provisions</h2>
                        <p>You always know where to find me. Email <strong>kontakt@wuyo.pl</strong> if you have any doubts or questions about your data.</p>
                        <p className="mt-4 text-sm text-white/50">Last updated: 27 October 2026.</p>
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
}
