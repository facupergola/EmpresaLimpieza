import { mailtoLink, notifText, whatsappLink } from "@/lib/notif";
import type { AppConfig, Shift } from "@/lib/types";

/** Port de notifBtns(): botones "Avisar por WhatsApp / email". */
export function NotifButtons({ r, out, cfg }: { r: Shift; out: boolean; cfg: AppConfig }) {
  const text = notifText(r, out);
  const wa = whatsappLink(cfg.phone, text);
  const em = mailtoLink(cfg.email, r, out, text);
  if (!wa && !em) return null;
  return (
    <div className="btns">
      {wa && (
        <a className="wa" target="_blank" rel="noopener" href={wa}>
          💬 Avisar por WhatsApp
        </a>
      )}
      {em && (
        <a className="em" href={em}>
          ✉️ Avisar por email
        </a>
      )}
    </div>
  );
}
