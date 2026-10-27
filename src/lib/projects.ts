export type Project = {
    id: number;
    title: string;
    category: string;
    image: string;
    images?: string[];
    desc?: string;
    demoUrl?: string;
    year?: string;
    cardObjectPosition?: string;
};

export const TABS = [
    { id: "Wszystkie", label: "Wszystkie" },
    { id: "Logotypy/Branding", label: "Branding" },
    { id: "Do druku", label: "Druk" },
    { id: "Strony Internetowe", label: "Strony WWW" },
    { id: "Social media", label: "Social" },
    { id: "Odzież/Gadżety", label: "Gadżety" },
];

export const projects: Project[] = [
    { id: 2, title: "Wizytówka Czysta Gablota", category: "Do druku", image: "/realizacje/CzystaGablota-Wizytowka-mockup.webp", images: ["/realizacje/CzystaGablota-Wizytowka-mockup2.webp"], desc: "Detailing · spójna identyfikacja wizualna", year: "2024", cardObjectPosition: "top" },
    { id: 14, title: "Gama Ubezpieczeń – Materiały firmowe", category: "Do druku", image: "/realizacje/gama-ubezpieczen.webp", images: ["/realizacje/gama-ubezpieczen-mockup1.webp", "/realizacje/gama-ubezpieczen-mockup2.webp"], desc: "Biuro ubezpieczeń · ulotka, strona informacyjna, wizytówka", year: "2025" },
    { id: 16, title: "Kribus Studio – Identyfikacja wizualna", category: "Logotypy/Branding", image: "/realizacje/kribus-logo-mockup.webp", images: ["/realizacje/kribus-logo-biuro-mockup.webp", "/realizacje/kribus-wizytowka-mockup.webp", "/realizacje/kribus-wizytowka-mockup2.webp", "/realizacje/kribus-ulotka-a5-mockup.webp", "/realizacje/kribus-ulotka-a5-mockup2.webp"], desc: "Studio stron internetowych · logo, księga znaku, wizytówka i ulotka A5", year: "2026" },
    { id: 17, title: "Billboard Dobrze Rozegrane", category: "Do druku", image: "/realizacje/dobrze-rozegrane-billboard.webp", images: ["/realizacje/dobrze-rozegrane-billboard2.webp"], desc: "Wynajem gier XXL na wesela · billboard w dwóch koncepcjach", year: "2026" },
    { id: 12, title: "Billboard Wege", category: "Do druku", image: "/realizacje/billboard-wege.webp", desc: "Dom kultury · plakat promujący spotkania Wege Pogadanki", year: "2024" },
    { id: 7, title: "Wizytówka Premium", category: "Do druku", image: "/realizacje/business-card-mockup.webp", desc: "Klient premium · projekt wizytówki", year: "2023" },
    { id: 15, title: "Wizytówka Memorial", category: "Do druku", image: "/realizacje/memorial-wizytowka-mockup.webp", desc: "Zakład kamieniarski · projekt + druk wizytówki dwustronnej", year: "2025" },
    { id: 8, title: "Czysta Gablota – Strona WWW", category: "Strony Internetowe", image: "/realizacje/gablota-www.webp", desc: "Detailing · strona generująca zapytania od dnia 1", demoUrl: "https://www.czystagablota.pl", year: "2024" },
    { id: 10, title: "Wizytówka Stanisław Czudec", category: "Do druku", image: "/realizacje/wizytowka-mockup-s-czudec.webp", desc: "Usługi profesjonalne · elegancka wizytówka jednostronna", year: "2024" },
    { id: 13, title: "Billboard Domosfera", category: "Do druku", image: "/realizacje/domosfera-billboard.webp", desc: "Dystrybucja drzwi, okien i bram · projekt dużego billboardu", year: "2024" },
    { id: 3, title: "Logo Arkom", category: "Logotypy/Branding", image: "/realizacje/logo_arkom.webp", desc: "Firma technologiczna · identyfikacja wizualna od zera", year: "2023" },
    { id: 4, title: "Prezentacja Marki Arkom", category: "Logotypy/Branding", image: "/realizacje/arkom-present.webp", desc: "Firma technologiczna · brand book i prezentacja dla inwestorów", year: "2023" },
    { id: 11, title: "Projekt Etykiet", category: "Do druku", image: "/realizacje/projekt-etykiet.webp", desc: "Produkty spożywcze · etykiety gotowe do druku offset", year: "2024" },
    { id: 6, title: "T-shirt Czysta Gablota", category: "Odzież/Gadżety", image: "/realizacje/cg-tshirt.webp", desc: "Detailing · projekt koszulki firmowej", year: "2024" },
    { id: 1, title: "Naklejka Admar", category: "Do druku", image: "/realizacje/naklejka_Admar_Mockup.webp", desc: "ADMAR · projekt naklejki", year: "2023" },
];

// ── Wersja angielska ─────────────────────────────────────────────────────────
// Kategorie zostają po polsku jako identyfikatory (filtr zakładek), tłumaczymy
// tylko to, co widać. Nowy projekt bez wpisu tutaj pokaże się po polsku.

const TAB_LABELS_EN: Record<string, string> = {
    "Wszystkie": "All",
    "Logotypy/Branding": "Branding",
    "Do druku": "Print",
    "Strony Internetowe": "Websites",
    "Social media": "Social",
    "Odzież/Gadżety": "Merch",
};

const CATEGORY_EN: Record<string, string> = {
    "Logotypy/Branding": "Logo / Branding",
    "Do druku": "Print",
    "Strony Internetowe": "Website",
    "Social media": "Social media",
    "Odzież/Gadżety": "Apparel / Merch",
};

const PROJECTS_EN: Record<number, { title: string; desc: string }> = {
    2: { title: "Czysta Gablota business card", desc: "Car detailing · consistent visual identity" },
    14: { title: "Gama Ubezpieczeń: company materials", desc: "Insurance office · flyer, info page, business card" },
    16: { title: "Kribus Studio: visual identity", desc: "Web studio · logo, brand book, business card and A5 flyer" },
    17: { title: "Dobrze Rozegrane billboard", desc: "XXL games for weddings · billboard in two concepts" },
    12: { title: "Wege billboard", desc: "Community centre · poster for the Wege Pogadanki meetings" },
    7: { title: "Premium business card", desc: "Premium client · business card design" },
    15: { title: "Memorial business card", desc: "Stonemason · design and print of a double-sided card" },
    8: { title: "Czysta Gablota website", desc: "Car detailing · a site bringing enquiries from day one" },
    10: { title: "Stanisław Czudec business card", desc: "Professional services · elegant single-sided card" },
    13: { title: "Domosfera billboard", desc: "Doors, windows and gates · large billboard design" },
    3: { title: "Arkom logo", desc: "Tech company · visual identity from scratch" },
    4: { title: "Arkom brand presentation", desc: "Tech company · brand book and investor deck" },
    11: { title: "Label design", desc: "Food products · labels ready for offset print" },
    6: { title: "Czysta Gablota T-shirt", desc: "Car detailing · company T-shirt design" },
    1: { title: "Admar sticker", desc: "ADMAR · sticker design" },
};

export function tabLabel(id: string, label: string, locale: "pl" | "en"): string {
    return locale === "en" ? TAB_LABELS_EN[id] ?? label : label;
}

export function categoryLabel(category: string, locale: "pl" | "en"): string {
    return locale === "en" ? CATEGORY_EN[category] ?? category : category;
}

export function localizeProject(project: Project, locale: "pl" | "en"): Project {
    if (locale === "pl") return project;
    const en = PROJECTS_EN[project.id];
    return en ? { ...project, title: en.title, desc: en.desc } : project;
}
