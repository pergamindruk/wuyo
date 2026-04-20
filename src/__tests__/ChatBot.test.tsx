import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatBot from "@/components/ChatBot";

describe("ChatBot", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ message: "Hej! Jak mogę pomóc?" }),
        } as Response);
    });

    it("TC-1 renderuje przycisk triggera 'Porozmawiajmy' przy zamkniętym oknie", () => {
        render(<ChatBot />);
        expect(screen.getByRole("button", { name: /Otwórz chat/i })).toBeInTheDocument();
        expect(screen.queryByRole("log")).not.toBeInTheDocument();
    });

    it("TC-2 otwiera okno i wyświetla wiadomość powitalną po kliknięciu triggera", async () => {
        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));

        expect(await screen.findByRole("log")).toBeInTheDocument();
        expect(
            screen.getByText(/Zamiast tracić czas na szukanie/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /Zamknij okno czatu/i })
        ).toBeInTheDocument();
    });

    it("TC-3 wysyła wiadomość i wyświetla odpowiedź asystenta", async () => {
        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));
        await screen.findByRole("log");

        const input = screen.getByRole("textbox", { name: /Wpisz wiadomość/i });
        await user.type(input, "Ile kosztuje logo?");
        await user.click(screen.getByRole("button", { name: /Wyślij wiadomość/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "/api/chat",
                expect.objectContaining({ method: "POST" })
            );
        }, { timeout: 3000 });

        expect(await screen.findByText("Hej! Jak mogę pomóc?")).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByRole("textbox", { name: /Wpisz wiadomość/i })).toHaveValue("")
        );
    });

    it("TC-4 pokazuje 'Chwilowo dużo ruchu' przy odpowiedzi RATE_LIMIT", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ error: "RATE_LIMIT" }),
        } as Response);

        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));
        await screen.findByRole("log");

        const input = screen.getByRole("textbox", { name: /Wpisz wiadomość/i });
        await user.type(input, "Test");
        await user.click(screen.getByRole("button", { name: /Wyślij wiadomość/i }));

        expect(await screen.findByText(/Chwilowo dużo ruchu/i)).toBeInTheDocument();
    });

    it("TC-5 pokazuje 'Problem z siecią' gdy fetch rzuca wyjątek", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));
        await screen.findByRole("log");

        const input = screen.getByRole("textbox", { name: /Wpisz wiadomość/i });
        await user.type(input, "Test błędu");
        await user.click(screen.getByRole("button", { name: /Wyślij wiadomość/i }));

        expect(await screen.findByText(/Problem z siecią/i)).toBeInTheDocument();
    });

    it("TC-6 zamyka okno przyciskiem X w nagłówku", async () => {
        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));
        expect(screen.getByRole("log")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Zamknij okno czatu/i }));

        await waitFor(() => {
            expect(screen.queryByRole("log")).not.toBeInTheDocument();
        });
    });

    it("TC-7 przycisk Send jest disabled gdy input jest pusty", async () => {
        render(<ChatBot />);
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /Otwórz chat/i }));
        await screen.findByRole("log");

        const sendBtn = screen.getByRole("button", { name: /Wyślij wiadomość/i });

        expect(sendBtn).toBeDisabled();
    });
});
