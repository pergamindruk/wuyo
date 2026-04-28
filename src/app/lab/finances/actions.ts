'use server'

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { getModel } from '@/lib/gemini'
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

        const model = getModel('document')

        const prompt = `Jesteś zautomatyzowanym systemem księgowym WUYO (rok 2026). Twoim jedynym zadaniem jest wygenerowanie perfekcyjnego, sformalizowanego i gotowego do druku dokumentu: ${documentType}.

        WAŻNY PRAWNY KONTEKST (DZIAŁALNOŚĆ NIEREJESTROWANA):
        ${knowledge}

        DANE DO DOKUMENTU:
        - Nabywca/Klient: ${clientInfo}
        - Sprzedawca (Wystawca): Mateusz Machoś (WUYO Dobra Grafa)
        - Kwota do zapłaty (końcowa, po ewentualnych korektach): ${amount} PLN
        - Opis przedmiotu transakcji (może zawierać informacje o korekcie ilości, zaliczce, itp.): ${description}
        - Data wystawienia: ${issueDate}
        - Data sprzedaży / wykonania usługi: ${saleDate}
        - Miejsce wystawienia: Rzeszów

        WYTYCZNE DLA GENERATORA (MUSISZ ICH DOKŁADNIE PRZESTRZEGAĆ):

        1. Zwróć TYLKO I WYŁĄCZNIE czysty kod Markdown reprezentujący dokument. ZERO WSTĘPÓW ani podsumowań. Nie owijaj wyniku w blok kodu (\`\`\`).

        2. KRYTYCZNE – TABELA MARKDOWN: Tabela MUSI być w pełni wypełniona. Każda komórka musi mieć wartość. Użyj dokładnie tego formatu (pipe na początku i końcu, separator ---):

        | Lp. | Nazwa usługi / produktu | Jednostka miary | Ilość | Kwota (PLN) |
        |-----|------------------------|-----------------|-------|-------------|
        | 1   | [opis usługi]          | [jednostka]     | [ilość] | [kwota]  |

        Jeśli opis zawiera informację o zaliczce lub korekcie ilości, dodaj osobne wiersze w tabeli:
        - wiersz z główną usługą i jej pełną wartością
        - wiersz "Zaliczka (wpłacona)" z wartością ujemną (np. -600,00)
        Ostatni wiersz podsumowujący z łączną kwotą do zapłaty: ${amount} PLN.

        3. UKŁAD DOKUMENTU:
           - Nagłówek (wyrównany do prawej przez spacje/znak |): **Miejscowość:** Rzeszów, **Data wystawienia:** ${issueDate}, **Data sprzedaży:** ${saleDate}
           - Duży nagłówek: # Faktura nr .../miesiąc słownie/rok lub # Rachunek nr ...
           - **Sprzedawca:** Mateusz Machoś (WUYO Dobra Grafa) — bez adresu, bez PESEL
           - **Nabywca:** dane z pola Nabywca
           - Tabela (patrz punkt 2)
           - **Kwota do zapłaty: ${amount} PLN** (pogrubione, wyraźne)
           - Dopisek o zwolnieniu z VAT na podstawie art. 113 ust. 1 i 9 ustawy o VAT
           - Jeśli była zaliczka lub korekta ilości – dodaj sekcję **Uwagi** z krótkim wyjaśnieniem
           - Miejsca na podpisy: "Podpis Sprzedawcy: ........................" i "Podpis Nabywcy: ........................"

        4. Dokument to formalny dowód księgowy. Brak języka potocznego. Brak cudzysłowów wokół całego wyniku.`

        const result = await model.generateContent(prompt)

        // Dodaj wpis do ewidencji automatycznie w tle
        await addEwidencja({
            documentType,
            date: saleDate,
            clientInfo,
            description,
            amount: parseFloat(amount)
        })

        return { success: true, markdown: result.response.text() }
    } catch (error: any) {
        console.error('Gemini API Error:', error)
        return { success: false, error: 'Nie udało się wygenerować dokumentu. Błąd: ' + (error.message || '') }
    }
}
