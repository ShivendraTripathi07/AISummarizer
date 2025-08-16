// lib/mailer.ts
import emailjs from "@emailjs/browser";

interface EmailParams {
    toEmail: string;
    fromEmail: string;  // Make this required
    name: string;
    title: string;
    message: string;
}

export const sendEmail = async (params: EmailParams) => {
    try {
        const result = await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, // service ID
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!, // template ID
            {
                to_email: params.toEmail,        // Recipient email
                from_email: params.fromEmail,    // This should be the actual sender's email
                from_name: params.name,          // Sender's name
                reply_to: params.fromEmail,      // Reply-to address
                subject: params.title,           // Email subject
                message: params.message,         // Email content/body
                title: params.title,             // Keep this for backward compatibility
                name: params.name,               // Keep this for backward compatibility
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! // public key
        );
        return { success: true, result };
    } catch (error) {
        console.error("EmailJS Error:", error);
        return { success: false, error };
    }
};