'use server'

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { generateWithFallback } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/audit'

export async function getEwidencja() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('finances')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching finances:', error)
        return []
    }
    
    return data.map((item: any) => ({
        id: item.id,
        documentType: item.document_type,
        date: item.date,
        clientInfo: item.client_info,
        description: item.description,
        amount: Number(item.amount),
        paymentStatus: item.payment_status || 'Wystawiona',
        createdAt: item.created_at,
    }))
}

export async function addEwidencja(entry: any) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('finances')
        .insert([{
            document_type: entry.documentType,
            date: entry.date,
            client_info: entry.clientInfo,
            description: entry.description,
            amount: entry.amount
        }])
        .select()
        .single()

    if (error) {
        console.error('Error adding finance entry:', error)
        return null
    }

    await logAuditEvent('finance_add', { description: entry.description, amount: entry.amount })
    revalidatePath('/lab/finances')
    return {
        id: data.id,
        documentType: data.document_type,
        date: data.date,
        clientInfo: data.client_info,
        description: data.description,
        amount: Number(data.amount)
    }
}

export async function deleteEwidencja(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('finances')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting finance entry:', error)
        return false
    }
    
    await logAuditEvent('finance_delete', { id })
    revalidatePath('/lab/finances')
    return true
}

export async function updatePaymentStatus(id: string, status: string) {
    const validStatuses = ['Wystawiona', 'Zaplacona', 'Przeterminowana']
    if (!validStatuses.includes(status)) {
        throw new Error(`Nieprawidlowy status platnosci: ${status}`)
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('finances')
        .update({ payment_status: status })
        .eq('id', id)

    if (error) {
        console.error('Error updating payment status:', error)
        throw new Error('Nie udalo sie zaktualizowac statusu platnosci')
    }

    await logAuditEvent('finance_update', { id, status })
    revalidatePath('/lab/finances')
    return true
}

export async function generateDocument(documentType: string, clientInfo: string, amount: string, description: string, saleDate: string, issueDate: string) {
    try {
        const kbPath = path.join(process.cwd(), 'src', 'app', 'lab', 'knowledge', 'nierejestrowana-2026.md')
        const knowledge = await fs.readFile(kbPath, 'utf-8').catch(() => '')

        const prompt = `Jesteś zautomatyzowanym systemem księgowym (rok 2026). Twoim jedynym zadaniem jest wygenerowanie perfekcyjnego, sformalizowanego i gotowego do druku dokumentu: ${documentType}.

        KONTEKST PRAWNY (DZIAŁALNOŚĆ NIEREJESTROWANA):
        ${knowledge}

        DANE DO DOKUMENTU:
        - Nabywca/Klient: ${clientInfo}
        - Sprzedawca (Wystawca, osoba fizyczna prowadząca działalność nierejestrowaną):
            Mateusz Machoś
            ul. Siemieńskiego 17A/38
            35-203 Rzeszów
        - Kwota do zapłaty (końcowa, po ewentualnych korektach): ${amount} PLN
        - Opis przedmiotu transakcji (może zawierać informacje o korekcie ilości, zaliczce, itp.): ${description}
        - Data wystawienia: ${issueDate}
        - Data sprzedaży / wykonania usługi: ${saleDate}
        - Miejsce wystawienia: Rzeszów

        WYTYCZNE DLA GENERATORA (MUSISZ ICH DOKŁADNIE PRZESTRZEGAĆ):

        1. Zwróć TYLKO I WYŁĄCZNIE czysty kod Markdown reprezentujący dokument. ZERO WSTĘPÓW ani podsumowań. Nie owijaj wyniku w blok kodu (\`\`\`).

        2. NAZEWNICTWO: Dokument to zawsze RACHUNEK (nie Faktura). Sprzedawca to osoba fizyczna bez działalności gospodarczej. NIE używaj nazwy "WUYO" ani żadnej nazwy handlowej w sekcji Sprzedawcy – tylko imię, nazwisko i adres.

        3. KRYTYCZNE – TABELA MARKDOWN: Tabela MUSI być w pełni wypełniona. Każda komórka musi mieć wartość. Użyj dokładnie tego formatu:

        | Lp. | Nazwa usługi / produktu | Jednostka miary | Ilość | Kwota (PLN) |
        |-----|------------------------|-----------------|-------|-------------|
        | 1   | [opis usługi]          | [jednostka]     | [ilość] | [kwota]  |

        Jeśli opis zawiera informację o zaliczce lub korekcie ilości, dodaj osobne wiersze:
        - wiersz z główną usługą i jej pełną wartością (jednostka adekwatna do usługi, np. "szt.", "godz.", "komplet")
        - wiersz "Zaliczka (wpłacona)" – jednostka miary: "usługa", ilość: 1, wartość ujemna (np. -600,00)
        - ostatni wiersz podsumowujący: | – | **Razem do zapłaty** | – | – | **${amount}** |

        4. UKŁAD DOKUMENTU (kolejność obowiązkowa):
           - Nagłówek po prawej: **Miejscowość:** Rzeszów &nbsp;&nbsp; **Data wystawienia:** ${issueDate} &nbsp;&nbsp; **Data sprzedaży:** ${saleDate}
           - Duży nagłówek: # Rachunek nr [numer]/[miesiąc cyfrowo 01-12]/[rok] (np. 01/04/2026)
           - **Sprzedawca:** Mateusz Machoś, ul. Siemieńskiego 17A/38, 35-203 Rzeszów
           - **Nabywca:** dane z pola Nabywca
           - Tabela (patrz punkt 3)
           - **Kwota do zapłaty: ${amount} PLN** (pogrubione)
           - Dwa dopiski prawne (oba obowiązkowe):
             a) _Sprzedawca prowadzi działalność nierejestrowaną w rozumieniu art. 5 ust. 1 ustawy Prawo przedsiębiorców. Przychód zostanie wykazany przez Sprzedawcę w zeznaniu rocznym PIT-36 jako przychód z innych źródeł._
             b) _Sprzedawca zwolniony z podatku od towarów i usług na podstawie art. 113 ust. 1 i 9 ustawy o VAT._
           - Jeśli była zaliczka lub korekta ilości – sekcja **Uwagi** z wyjaśnieniem (bez języka potocznego)
           - Miejsca na podpisy: "Podpis Sprzedawcy: ........................" i "Podpis Nabywcy: ........................"

        5. Dokument to formalny dowód księgowy. Brak języka potocznego. Brak cudzysłowów wokół całego wyniku.`

        const markdown = await generateWithFallback('document', prompt)

        // Dodaj wpis do ewidencji automatycznie w tle
        await addEwidencja({
            documentType,
            date: saleDate,
            clientInfo,
            description,
            amount: parseFloat(amount)
        })

        return { success: true, markdown }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się wygenerować dokumentu. Błąd: ' + (error.message || '') }
    }
}
