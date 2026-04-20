import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_MODEL = 'gemini-2.5-flash'

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')
