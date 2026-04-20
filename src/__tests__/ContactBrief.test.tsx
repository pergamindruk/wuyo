import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suspense } from "react";
import { ContactBrief } from "@/components/ContactBrief";

function renderBrief() {
    return render(
        <Suspense fallback={null}>
            <ContactBrief />
        </Suspense>
    );
}

describe("ContactBrief", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        } as Response);
    });

    it("TC-1 renderuje nagłówek, 3 zakładki i pola kontaktowe", () => {
        renderBrief();
        expect(screen.getByText(/Zacznijmy tworzyć wizerunek/i)).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Wiadomość/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Logo \/ Branding/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /Strona WWW/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Imię \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/E-mail \*/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Wyślij, załatwione/i })).toBeInTheDocument();
    });

    it("TC-2 pokazuje błędy walidacji przy pustym formularzu (path=quick)", async () => {
        renderBrief();
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        expect(await screen.findByText("Podaj swoje imię")).toBeInTheDocument();
        expect(await screen.findByText("Podaj adres e-mail")).toBeInTheDocument();
        expect(await screen.findByText("Zostaw krótką wiadomość")).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("TC-3 pokazuje błąd przy nieprawidłowym formacie e-mail", async () => {
        renderBrief();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Imię \*/i), "Jan");
        await user.type(screen.getByLabelText(/E-mail \*/i), "to-nie-email");
        await user.type(
            screen.getByPlaceholderText(/Hej Wuyo/i),
            "Potrzebuję logo"
        );
        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        expect(await screen.findByText("Nieprawidłowy adres e-mail")).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("TC-4 wysyła formularz i pokazuje ekran sukcesu", async () => {
        renderBrief();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Imię \*/i), "Anna");
        await user.type(screen.getByLabelText(/E-mail \*/i), "anna@test.pl");
        await user.type(
            screen.getByPlaceholderText(/Hej Wuyo/i),
            "Potrzebuję logo dla kawiarni"
        );
        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalledOnce());
        expect(global.fetch).toHaveBeenCalledWith(
            "/api/brief",
            expect.objectContaining({ method: "POST" })
        );
        expect(await screen.findByText(/Wiadomość poszła w świat/i)).toBeInTheDocument();
        expect(screen.getByText("anna@test.pl")).toBeInTheDocument();
    });

    it("TC-5 pokazuje błąd gdy API zwraca błąd HTTP", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ error: "Błąd serwera" }),
        } as Response);

        renderBrief();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Imię \*/i), "Piotr");
        await user.type(screen.getByLabelText(/E-mail \*/i), "piotr@test.pl");
        await user.type(
            screen.getByPlaceholderText(/Hej Wuyo/i),
            "Pytanie o stronę"
        );
        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        expect(await screen.findByText(/Coś się posypało podczas wysyłania/i)).toBeInTheDocument();
        expect(screen.queryByText(/Wiadomość poszła w świat/i)).not.toBeInTheDocument();
    });

    it("TC-6 przełączenie na zakładkę Branding pokazuje pola brandingowe", async () => {
        renderBrief();
        const user = userEvent.setup();

        await user.click(screen.getByRole("tab", { name: /Logo \/ Branding/i }));

        expect(screen.getByPlaceholderText(/np\. Złoty Piec/i)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/Hej Wuyo/i)).not.toBeInTheDocument();
    });

    it("TC-7 ignoruje submit gdy honeypot jest wypełniony", async () => {
        renderBrief();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Imię \*/i), "Anna");
        await user.type(screen.getByLabelText(/E-mail \*/i), "anna@test.pl");

        const honeypot = document.querySelector<HTMLInputElement>('input[name="botField"]')!;
        expect(honeypot).not.toBeNull();
        honeypot.value = "spam-bot";
        honeypot.dispatchEvent(new Event("input", { bubbles: true }));

        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("TC-8 przycisk jest disabled i pokazuje 'Wysyłam...' podczas wysyłania", async () => {
        global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

        renderBrief();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Imię \*/i), "Kasia");
        await user.type(screen.getByLabelText(/E-mail \*/i), "kasia@test.pl");
        await user.type(
            screen.getByPlaceholderText(/Hej Wuyo/i),
            "Pytanie o cennik"
        );
        await user.click(screen.getByRole("button", { name: /Wyślij, załatwione/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Wysyłam/i })).toBeDisabled();
        });
    });
});
