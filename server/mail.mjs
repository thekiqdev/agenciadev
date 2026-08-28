/**
 * Envio de e-mail via SMTP (nodemailer), usando credenciais de site_settings.
 */
import nodemailer from "nodemailer";

/**
 * @param {object} settings
 * @returns {boolean}
 */
export function isSmtpReady(settings) {
  if (!settings?.smtp_enabled) return false;
  return Boolean(
    settings.smtp_host &&
      settings.smtp_port &&
      settings.smtp_user &&
      settings.smtp_pass &&
      (settings.smtp_to || settings.contact_email || settings.smtp_from)
  );
}

/**
 * @param {object} settings row de site_settings (com smtp_pass em claro)
 * @param {{ subject: string; text: string; html?: string; replyTo?: string }} mail
 */
export async function sendMailWithSettings(settings, mail) {
  if (!isSmtpReady(settings)) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  const to =
    (settings.smtp_to && String(settings.smtp_to).trim()) ||
    (settings.contact_email && String(settings.contact_email).trim()) ||
    settings.smtp_user;

  const from =
    (settings.smtp_from && String(settings.smtp_from).trim()) ||
    settings.smtp_user;

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: Number(settings.smtp_port) || 587,
    secure: Boolean(settings.smtp_secure),
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  return { sent: true, to };
}
