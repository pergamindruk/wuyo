import type { Project } from "./projects";

const SITE = "https://wuyo.pl";

/**
 * Kategorie z listy projektów w słowach, które coś znaczą dla wyszukiwarki.
 * "Do druku" samo w sobie nic Google nie mówi.
 */
const CATEGORY_LABELS: Record<string, string> = {
    "Logotypy/Branding": "Projekt logo i identyfikacji wizualnej",
    "Do druku": "Projekt graficzny do druku",
    "Strony Internetowe": "Projekt i wdrożenie strony internetowej",
    "Social media": "Grafika na social media",
    "Odzież/Gadżety": "Projekt nadruku na odzieży i gadżetach",
};

const AUTHOR = {
    "@type": "Person",
    name: "Mateusz Machoś",
    url: `${SITE}/o-mnie`,
    worksFor: {
        "@type": "Organization",
        name: "WUYO – Dobra Grafa",
        url: SITE,
    },
};

function absolute(path: string) {
    return path.startsWith("http") ? path : `${SITE}${path}`;
}

function creativeWork(project: Project) {
    const label = CATEGORY_LABELS[project.category] ?? project.category;

    return {
        "@type": "CreativeWork",
        name: project.title,
        // Bez opisu zostaje sama kategoria — lepsze to niż puste pole.
        description: project.desc ? `${project.desc}. ${label}.` : label,
        about: label,
        creator: AUTHOR,
        author: AUTHOR,
        image: [absolute(project.image), ...(project.images ?? []).map(absolute)],
        ...(project.year ? { dateCreated: project.year } : {}),
        ...(project.demoUrl ? { url: project.demoUrl } : {}),
        inLanguage: "pl-PL",
    };
}

/**
 * Schemat strony z realizacjami: CollectionPage + ItemList prac.
 *
 * Po co: bez tego portfolio jest dla Google "stroną ze zdjęciami". Z tym
 * każda praca ma nazwę, rodzaj, autora i rok — co daje szansę na trafienie
 * do Grafiki Google i wiąże prace z encją "Mateusz Machoś / WUYO".
 *
 * `numberOfItems` liczymy z faktycznej listy, nie z hasła marketingowego —
 * deklarowanie w danych strukturalnych większej liczby prac, niż strona
 * pokazuje, to prosta droga do utraty zaufania Google.
 */
export function portfolioCollectionSchema(projects: Project[]) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Realizacje WUYO – portfolio projektów graficznych i stron WWW",
        description:
            "Projekty graficzne i strony internetowe zrealizowane dla firm z Rzeszowa i okolic: logotypy, identyfikacja wizualna, materiały do druku, strony WWW i nadruki na odzieży.",
        url: `${SITE}/realizacje`,
        inLanguage: "pl-PL",
        isPartOf: {
            "@type": "WebSite",
            name: "WUYO – Dobra Grafa",
            url: SITE,
        },
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: projects.length,
            itemListElement: projects.map((project, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: creativeWork(project),
            })),
        },
    };
}
