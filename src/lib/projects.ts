export type Project = {
    id: number;
    title: string;
    category: string;
    image: string;
    images?: string[];
    desc?: string;
    demoUrl?: string;
    year?: string;
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
    { id: 14, title: "Gama Ubezpieczeń – Materiały firmowe", category: "Do druku", image: "/realizacje/gama-ubezpieczen.webp", images: ["/realizacje/gama-ubezpieczen-mockup1.webp", "/realizacje/gama-ubezpieczen-mockup2.webp"], desc: "Biuro ubezpieczeń · ulotka, strona informacyjna, wizytówka", year: "2025" },
    { id: 10, title: "Wizytówka Stanisław Czudec", category: "Do druku", image: "/realizacje/wizytowka-mockup-s-czudec.webp", desc: "Usługi profesjonalne · elegancka wizytówka jednostronna", year: "2024" },
    { id: 12, title: "Billboard Wege", category: "Do druku", image: "/realizacje/billboard-wege.webp", desc: "Dom kultury · plakat promujący spotkania Wege Pogadanki", year: "2024" },
    { id: 7, title: "Wizytówka Premium", category: "Do druku", image: "/realizacje/business-card-mockup.webp", desc: "Klient premium · projekt wizytówki", year: "2023" },
    { id: 8, title: "Czysta Gablota – Strona WWW", category: "Strony Internetowe", image: "/realizacje/gablota-www.webp", desc: "Detailing · strona generująca zapytania od dnia 1", demoUrl: "https://www.czystagablota.pl", year: "2024" },
    { id: 9, title: "Wuyo Lab – Panel CRM", category: "Strony Internetowe", image: "/realizacje/wuyo-lab-v2.webp", desc: "Własny projekt · panel do zarządzania projektami i klientami", year: "2024" },
    { id: 13, title: "Billboard Domosfera", category: "Do druku", image: "/realizacje/domosfera-billboard.webp", desc: "Dystrybucja drzwi, okien i bram · projekt dużego billboardu", year: "2024" },
    { id: 3, title: "Logo Arkom", category: "Logotypy/Branding", image: "/realizacje/logo_arkom.webp", desc: "Firma technologiczna · identyfikacja wizualna od zera", year: "2023" },
    { id: 4, title: "Prezentacja Marki Arkom", category: "Logotypy/Branding", image: "/realizacje/arkom-present.webp", desc: "Firma technologiczna · brand book i prezentacja dla inwestorów", year: "2023" },
    { id: 11, title: "Projekt Etykiet", category: "Do druku", image: "/realizacje/projekt-etykiet.webp", desc: "Produkty spożywcze · etykiety gotowe do druku offset", year: "2024" },
    { id: 2, title: "Wizytówka Czysta Gablota", category: "Do druku", image: "/realizacje/CzystaGablota-Wizytowka-mockup.webp", desc: "Detailing · spójna identyfikacja wizualna", year: "2024" },
    { id: 5, title: "Wizytówka Czysta Gablota v2", category: "Do druku", image: "/realizacje/CzystaGablota-Wizytowka-mockup2.webp", desc: "Detailing · wizytówka", year: "2024" },
    { id: 6, title: "T-shirt Czysta Gablota", category: "Odzież/Gadżety", image: "/realizacje/cg-tshirt.webp", desc: "Detailing · projekt koszulki firmowej", year: "2024" },
    { id: 1, title: "Naklejka Admar", category: "Do druku", image: "/realizacje/naklejka_Admar_Mockup.webp", desc: "ADMAR · projekt naklejki", year: "2023" },
];
