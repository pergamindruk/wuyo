import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_NOTIFICATION = "WUYO Studio <kontakt@wuyo.pl>";
export const FROM_CLIENT = "Mateusz z WUYO <kontakt@wuyo.pl>";
export const TO_MATEUSZ = "kontakt@wuyo.pl";
