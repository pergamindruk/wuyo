'use server'

import { createClient } from '@/lib/supabase/server'
import { KIND_LABEL, SELLER, parseReceipt, serializeReceipt, type ReceiptData, type ReceiptKind } from '@/lib/lab/receipt'
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
        markdownContent: item.markdown_content || null,
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
            amount: entry.amount,
            markdown_content: entry.markdownContent || null,
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

export async function updateMarkdownContent(id: string, markdownContent: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('finances')
        .update({ markdown_content: markdownContent })
        .eq('id', id)

    if (error) {
        console.error('Error updating markdown content:', error)
        return false
    }

    await logAuditEvent('finance_update', { id, action: 'markdown_edit' })
    revalidatePath('/lab/finances')
    return true
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

export type DocumentInput = {
    kind: ReceiptKind
    buyer: string
    description: string
    unit: string
    qty: number
    totalZl: number
    advanceZl: number
    saleDate: string
    issueDate: string
    payment: string
    dueDays: number
    notes: string
}

/** Rachunek / protokół ze stałego szablonu (bez AI). Numer: kolejny w miesiącu wystawienia, np. 02/11/2026. */
export async function createDocument(input: DocumentInput): Promise<{ success: true; data: ReceiptData } | { success: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    const total = Math.round(input.totalZl * 100)
    const advance = Math.round(Math.max(0, input.advanceZl) * 100)
    if (!input.buyer.trim() || !input.description.trim()) return { success: false, error: 'Uzupełnij nabywcę i opis usługi.' }
    if (input.kind !== 'protokol' && total <= 0) return { success: false, error: 'Kwota musi być większa od zera.' }

    const [y, m] = input.issueDate.split('-')
    const { data: existing } = await supabase.from('finances').select('markdown_content')
    const sameMonth = (existing ?? []).map((r) => parseReceipt(r.markdown_content as string | null))
        .filter((d): d is ReceiptData => !!d && d.kind !== 'protokol' && d.issueDate.startsWith(`${y}-${m}`)).length
    const number = input.kind === 'protokol'
        ? `P/${input.issueDate.replace(/-/g, '')}`
        : `${String(sameMonth + 1).padStart(2, '0')}/${m}/${y}`

    const data: ReceiptData = {
        kind: input.kind,
        number,
        place: 'Rzeszów',
        issueDate: input.issueDate,
        saleDate: input.saleDate,
        seller: SELLER,
        // Nabywca z pola tekstowego: każda linia albo fragment po przecinku to osobny wiersz na dokumencie.
        buyer: input.buyer.split(/\n|,\s*/).map((l) => l.trim()).filter(Boolean),
        items: [{ name: input.description.trim(), unit: input.unit || 'usł.', qty: input.qty || 1, amountGrosze: total + advance }],
        advanceGrosze: advance,
        totalGrosze: total,
        payment: input.payment,
        dueDays: input.dueDays,
        notes: input.notes.trim(),
    }

    await addEwidencja({
        documentType: KIND_LABEL[input.kind],
        date: input.saleDate,
        clientInfo: input.buyer.trim(),
        description: input.description.trim(),
        amount: input.kind === 'protokol' ? 0 : total / 100,
        markdownContent: serializeReceipt(data),
    })
    return { success: true, data }
}
