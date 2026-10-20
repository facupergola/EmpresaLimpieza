export type MsgState = { text: string; kind: "err" | "ok" | "info" } | null;

/** Port de msg(t,c): <div class="msg err|ok|info"> */
export function Msg({ m }: { m: MsgState }) {
  if (!m) return null;
  return <div className={`msg ${m.kind}`}>{m.text}</div>;
}
