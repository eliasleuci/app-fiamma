import { formatDate } from "./date-helpers";

export function createWhatsAppLink(
    phone: string,
    data: {
        service: string;
        date: Date;
        time: string;
        clientName: string;
    },
    lang: 'es' | 'en' = 'es'
): string {
    const formattedDate = formatDate(data.date);

    const messages = {
        es: `Hola! Me gustaría confirmar un turno:
        
🗓 *Servicio:* ${data.service}
📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${data.time}
👤 *Nombre:* ${data.clientName}

Espero confirmación. Gracias!`,
        en: `Hi! I'd like to confirm a booking:
        
🗓 *Service:* ${data.service}
📅 *Date:* ${formattedDate}
⏰ *Time:* ${data.time}
👤 *Name:* ${data.clientName}

I look forward to your confirmation. Thanks!`
    };

    const message = messages[lang];
    const cleanPhone = phone.replace(/\D/g, '');

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
