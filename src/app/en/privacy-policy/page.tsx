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
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 3 Hosting</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>The website is hosted (technically maintained) on the servers of <strong>Vercel Inc.</strong> (USA). Vercel processes data only on behalf of the Operator, to the extent needed to run the website.</li>
                            <li>Vercel Inc. participates in the EU-U.S. Data Privacy Framework, so data is transferred to the USA under the European Commission adequacy decision (Art. 45 GDPR).</li>
                            <li>We never sell your data.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 4 Your rights and further information on how data is used</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>In some situations the controller may pass your personal data to other recipients if this is necessary to perform the contract concluded with you. This applies to the following groups of recipients:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>the hosting company, under a data processing agreement,</li>
                                    <li>authorised employees and associates.</li>
                                </ul>
                            </li>
                            <li>Your personal data is processed by the controller no longer than necessary to carry out the related activities set out in separate regulations.</li>
                            <li>You have the right to request from the controller:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>access to your personal data,</li>
                                    <li>its rectification, erasure or restriction of processing,</li>
                                    <li>data portability.</li>
                                </ul>
                            </li>
                            <li>Providing personal data is voluntary but necessary to handle enquiries and deliver the service.</li>
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
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
}
