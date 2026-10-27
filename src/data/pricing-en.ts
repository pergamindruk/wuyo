// Angielska wersja data/pricing.ts dla /en/pricing. KWOTY 1:1 z pricing.ts (źródło: CENNIK.md).
// Zmiana ceny = zmiana w pricing.ts, tutaj i w CENNIK.md.
// Nazwy pakietów zostają polskie (to nazwy produktów) — po nich formularz rozpoznaje pakiet.

import type { PriceRangeGroup, PricingCardData, PricingGroupData } from "@/data/pricing";

export const sectionHeaderEn = {
    eyebrow: "Pricing",
    title: "Clear pricing. You know what you'll pay before you call.",
    subtitle: "Brand, website and ongoing care for businesses in Rzeszów and beyond. Prices are public from the start, with no hidden costs or extras along the way. Prices net, plus 23% VAT.",
};

export const aLaCarteEn = {
    siteFrom: "1,990 PLN",
    logoFrom: "890 PLN",
};

export const perksEn = [
    { title: "Public prices", desc: "You know what you'll pay before you even call." },
    { title: "Custom-made websites", desc: "Not assembled from a ready-made template." },
    { title: "Local in Rzeszów", desc: "We can meet in person, not just by email." },
    { title: "Ongoing care after launch", desc: "You're not left alone with your website." },
];

export const pricingFaqsEn = [
    { q: "How does payment work?", a: "A deposit to start, the rest after you approve the design. Subscriptions are paid upfront for each month." },
    { q: "Who owns the design?", a: "Once paid, I hand over full copyright and the source files. The design is yours." },
    { q: "How many revisions are included?", a: "Revisions to the chosen concept are included: we work until you approve." },
    { q: "I only want a website or only a logo. Is that possible?", a: "Yes. A custom website from 1,990 PLN, a logo from 890 PLN. Write to me for a quote." },
    { q: "Can I cancel the subscription?", a: "Yes, at any time with one month's notice. No yearly commitment." },
];

export const finalCtaEn = {
    title: "Not sure which package fits your business?",
    text: "Tell me in two sentences what you do and I'll reply with a specific recommendation and quote. No obligation.",
    button: "Ask for a quote",
};

const once: PricingCardData[] = [
    {
        eyebrow: "Testing an idea, want to start cheap",
        name: "Marka Mini",
        tagline: "The smallest step to stop working without a logo and business cards.",
        price: "1,090 PLN",
        priceSuffix: "one-off",
        listPrice: "1,239 PLN",
        saving: "149 PLN",
        features: [
            "A detailed brief at the start, so the first logo concept hits the mark, plus 2 backup directions",
            "Logo in 3 versions: horizontal, vertical, mono",
            "100 business cards: double-sided design + print",
            "Full design rights + source files",
        ],
        delivery: "Turnaround: 5–7 working days",
        cta: "Start with Mini",
        highlighted: false,
    },
    {
        eyebrow: "New businesses, trades, local services",
        name: "Marka Start",
        tagline: "Everything a new business needs to look serious from day one.",
        price: "1,490 PLN",
        priceSuffix: "one-off",
        listPrice: "2,119 PLN",
        saving: "629 PLN",
        features: [
            "A detailed brief at the start, so the first logo concept hits the mark, plus 2 backup directions",
            "Logo in 3 versions: horizontal, vertical, mono",
            "Mini brand book: colours, fonts, usage rules",
            "150 business cards: double-sided design + print",
            "Email signature ready to paste",
            "Full design rights + source files",
        ],
        delivery: "Turnaround: 7–10 working days",
        cta: "Start with a brand",
        highlighted: false,
    },
    {
        eyebrow: "Construction, services, clinics, workshops",
        name: "Firma w Internecie",
        tagline: "An online presence that brings enquiries, not just looks nice.",
        price: "3,490 PLN",
        priceSuffix: "one-off",
        listPrice: "5,308 PLN",
        saving: "1,818 PLN",
        features: [
            "Everything in Marka Start",
            "Custom website up to 5 pages, written from scratch, not a template",
            "Domain and hosting for the first year included",
            "Contact form + directions map",
            "Polished mobile version",
            "Basic local SEO: Rzeszów and the area",
            "Training: how to change the website content yourself",
            "First month of website care included",
        ],
        delivery: "Turnaround: 7–21 days",
        cta: "I want this website",
        highlighted: true,
        badge: "Most popular",
    },
    {
        eyebrow: "Businesses that want to be found straight away",
        name: "Pełny Start",
        tagline: "Brand, website and Google visibility: a complete turnkey start.",
        price: "5,900 PLN",
        priceSuffix: "one-off",
        listPrice: "8,268 PLN",
        saving: "2,368 PLN",
        features: [
            "Everything in Firma w Internecie",
            "300 business cards instead of 150 + an A5 flyer",
            "Social media graphic templates",
            "Google Business Profile: setup, configuration, optimisation",
            "Review strategy: how to collect and reply to reviews",
            "3 months of full visibility: Google profile, reviews, 5–6 graphics a month, report",
            "Priority turnaround",
        ],
        delivery: "Turnaround: 14–21 days",
        cta: "Start the full package",
        highlighted: false,
    },
];

const monthly: PricingCardData[] = [
    {
        eyebrow: "You already have a website and want peace of mind",
        name: "Opieka Strony",
        tagline: "Your website just works, and you don't have to think about it.",
        price: "199 PLN",
        priceSuffix: "/ month",
        features: [
            "Website online non-stop (server included)",
            "I keep your domain from expiring",
            "Backups: if something breaks, I restore it",
            "Protection from break-ins and uptime checks",
            "1 hour of small changes a month (e.g. new opening hours, phone number)",
        ],
        delivery: "Reply within 48h",
        cta: "Look after my site",
        highlighted: false,
    },
    {
        eyebrow: "You want customers to find you and call",
        name: "Widoczność i Opieka",
        tagline: "Website care + visibility in Google when someone searches for a business like yours.",
        price: "690 PLN",
        priceSuffix: "/ month",
        features: [
            "Everything in Opieka Strony (site online and protected)",
            "I run your Google Business Profile and Maps listing",
            "I help collect reviews and reply to them for you",
            "5–6 ready graphics / posts a month",
            "A short monthly summary: what I did and what it achieved",
        ],
        delivery: "Reply within 48h",
        cta: "I want to be visible",
        highlighted: true,
        badge: "Most popular",
    },
    {
        eyebrow: "You need graphics every week, not every six months",
        name: "Stały Opiekun",
        tagline: "A designer and marketing on tap, without hiring anyone or waiting in a queue.",
        price: "1,290 PLN",
        priceSuffix: "/ month",
        features: [
            "Everything in Widoczność i Opieka",
            "Unlimited graphics: posts, banners, flyers, offers",
            "I run your social media, not just design for it",
            "You jump the queue: your work comes first",
            "A monthly call: what works, what we change",
        ],
        delivery: "Reply within 48h, priority",
        cta: "Start the subscription",
        highlighted: false,
    },
];

export const pricingGroupsEn: PricingGroupData[] = [
    { id: "jednorazowo", tabLabel: "One-off", heading: "Launch your brand and website", subheading: "A one-off turnkey project. You pay once, it lasts for years.", cards: once },
    { id: "abonament", tabLabel: "Monthly subscription", heading: "Ongoing care, so you're not alone after launch", subheading: "Choose once, it works every month. Cancel any time with one month's notice.", cards: monthly },
];

export const priceRangesEn: PriceRangeGroup[] = [
    {
        title: "Design",
        note: "Design only, print priced separately. Have a ready logo, photos and text? That's layout, not design, and it's cheaper.",
        items: [
            { name: "Logo and brand identity", price: "890 – 1,490 PLN" },
            { name: "Print materials (business card, flyer, poster, menu)", price: "160 – 480 PLN" },
            { name: "Outdoor advertising (banner, roll-up, sign)", price: "260 – 650 PLN" },
            { name: "Packaging and labels", price: "from 180 PLN" },
            { name: "Social media graphics", price: "90 – 1,350 PLN" },
            { name: "Layout from your ready materials", price: "from 200 PLN" },
        ],
    },
    {
        title: "Print and stationery",
        note: "Print only from a ready file. With design: business cards from 299 PLN, flyers from 449 PLN, stickers from 219 PLN. Order 2+ products and each additional one is 15% off.",
        items: [
            { name: "Business cards, print only (50 – 300 pcs)", price: "99 – 299 PLN" },
            { name: "A5 flyers, print only (50 – 300 pcs)", price: "119 – 359 PLN" },
            { name: "Stickers and labels, print only (50 – 200 pcs)", price: "89 – 229 PLN" },
            { name: "Vouchers, magnets, envelopes", price: "69 – 379 PLN" },
            { name: "Posters", price: "from 29 PLN / pc" },
        ],
    },
    {
        title: "Printed apparel",
        note: "DTF, full colour, no minimum: from a single piece.",
        items: [
            { name: "T-shirts", price: "49 – 79 PLN / pc" },
            { name: "Hoodies", price: "139 – 199 PLN / pc" },
            { name: "Printing on your own clothes", price: "from 45 PLN" },
        ],
    },
    {
        title: "Websites",
        note: "Next.js, local SEO, polished mobile version. Domain and hosting for the first year included.",
        items: [
            { name: "Landing page / one-page", price: "from 1,990 PLN" },
            { name: "Business website up to 5 pages", price: "2,990 PLN" },
            { name: "Online shop", price: "from 6,900 PLN" },
            { name: "Monthly care", price: "199 – 1,290 PLN / month" },
        ],
    },
];

export const faqsEn = [
    { question: "How much will it all cost?", answer: "I put my cards on the table. The pricing page has packages with specific prices and ranges for individual services, so you know the ballpark straight away. Tell me what you need and I'll give you an exact figure before work starts." },
    { question: "How does payment work?", answer: "Usually we split it in half: a 50% deposit before I open the design software, and 50% at the finish line, when you're smiling at the finished materials." },
    { question: "What if I don't like the design?", answer: "Before I start designing, we do a solid brief where I ask you about everything. That way I know what you need. After the design there are rounds of revisions to polish it, and I keep working until you're happy." },
    { question: "What if the print shop sends the file back with comments?", answer: "I fix it at my own cost. Preparing the file correctly is my job: scale, bleed, colours, resolution. This doesn't cover content changes after you approve the design, as that is new work." },
    { question: "Do I get editable / source files?", answer: "Of course. You're the boss and you pay for the design, so it's yours. I hand over all production packages, backgrounds, fonts, instructions and full vectors." },
    { question: "How long does a website usually take?", answer: "A one-page site is quick: 7–14 working days from collecting the materials. A lot depends on how fast you send content and photos and give feedback." },
    { question: "How will I know what stage my project is at?", answer: "You get your own client panel with a link where you can follow progress live, from the brief through design and revisions to final handover. Like tracking a parcel, except it actually works." },
];
