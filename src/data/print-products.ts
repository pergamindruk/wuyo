// Produkty druku z konfiguratora na /druk. Jedno źródło dla widoku i dla
// /api/order: serwer liczy cenę pozycji stąd, a nie z tego, co przysłała
// przeglądarka. Kwoty w złotych, tak jak w CENNIK.md.
//
// designFee = dopłata za projekt przy danym nakładzie. Tam, gdzie CENNIK.md
// (CZĘŚĆ 3) ma gotowy zestaw projekt + druk, wariant nadpisuje ją tak, żeby
// suma równała się cenie zestawu. Bez zestawu: cena projektu z CZĘŚCI 1.2.

export type PrintVariant = { qty: string; price: string; priceNum: number; designFee?: number };

export type PrintProductData = {
    id: string;
    name: string;
    note: string;
    designFee: number;
    variants: PrintVariant[];
};

export const PRINT_PRODUCTS: PrintProductData[] = [
    {
        id: "wizytowki", name: "Wizytówki", note: "dwustronne, 300g błysk", designFee: 190,
        variants: [
            { qty: "50 szt.", price: "99 zł", priceNum: 99, designFee: 200 },
            { qty: "100 szt.", price: "159 zł", priceNum: 159 },
            { qty: "150 szt.", price: "199 zł", priceNum: 199 },
            { qty: "300 szt.", price: "299 zł", priceNum: 299, designFee: 180 },
        ],
    },
    {
        id: "ulotki", name: "Ulotki A5", note: "dwustronne, pełny kolor", designFee: 300,
        variants: [
            { qty: "50 szt.", price: "119 zł", priceNum: 119 },
            { qty: "100 szt.", price: "189 zł", priceNum: 189, designFee: 260 },
            { qty: "150 szt.", price: "239 zł", priceNum: 239 },
            { qty: "300 szt.", price: "359 zł", priceNum: 359, designFee: 230 },
        ],
    },
    {
        id: "vouchery", name: "Vouchery / bony", note: "", designFee: 180,
        variants: [
            { qty: "50 szt.", price: "109 zł", priceNum: 109 },
            { qty: "100 szt.", price: "179 zł", priceNum: 179 },
        ],
    },
    {
        id: "naklejki", name: "Naklejki i etykiety", note: "", designFee: 160,
        variants: [
            { qty: "50 szt.", price: "89 zł", priceNum: 89, designFee: 130 },
            { qty: "100 szt.", price: "149 zł", priceNum: 149, designFee: 130 },
            { qty: "200 szt.", price: "229 zł", priceNum: 229 },
        ],
    },
    {
        id: "plakaty", name: "Plakaty", note: "", designFee: 350,
        variants: [
            { qty: "A4", price: "od 29 zł/szt.", priceNum: 29 },
            { qty: "A3", price: "od 39 zł/szt.", priceNum: 39 },
            { qty: "10+ szt.", price: "wycena indywidualna", priceNum: 0 },
        ],
    },
    {
        id: "magnesy", name: "Magnesy reklamowe", note: "z laminatem, format wizytówki", designFee: 130,
        variants: [
            { qty: "50 szt.", price: "229 zł", priceNum: 229 },
            { qty: "100 szt.", price: "379 zł", priceNum: 379 },
        ],
    },
    {
        id: "koperty", name: "Koperty z nadrukiem", note: "", designFee: 110,
        variants: [
            { qty: "25 szt.", price: "69 zł", priceNum: 69 },
            { qty: "50 szt.", price: "119 zł", priceNum: 119 },
        ],
    },
];

export function designFeeFor(product: PrintProductData, variant: PrintVariant | null): number {
    return variant?.designFee ?? product.designFee;
}

/** Cena pozycji: wariant + ewentualnie projekt. 0 = wycena indywidualna. */
export function priceFor(product: PrintProductData, variant: PrintVariant, withDesign: boolean): number {
    if (variant.priceNum === 0) return 0;
    return variant.priceNum + (withDesign ? designFeeFor(product, variant) : 0);
}

export type PricedLine = {
    productId: string;
    productName: string;
    qty: string;
    withDesign: boolean;
    priceNum: number;
};

/**
 * Pozycja koszyka z przeglądarki → pozycja z ceną z serwera.
 * null, gdy produktu albo wariantu nie ma w ofercie.
 */
export function pricedLine(raw: unknown): PricedLine | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const product = PRINT_PRODUCTS.find((p) => p.id === r.productId);
    if (!product) return null;
    const variant = product.variants.find((v) => v.qty === r.qty);
    if (!variant) return null;
    const withDesign = r.withDesign === true;
    return {
        productId: product.id,
        productName: product.name,
        qty: variant.qty,
        withDesign,
        priceNum: priceFor(product, variant, withDesign),
    };
}
