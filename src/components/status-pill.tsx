const success = ["PAID", "DELIVERED", "COMPLETED", "ACTIVE", "CONFIRMED"];
const warning = ["PENDING", "PENDING_PAYMENT", "NEW", "PROCESSING", "LOW_STOCK"];
const danger = ["CANCELLED", "PAYMENT_FAILED", "REFUNDED", "NO_SHOW"];

export function StatusPill({ value }: { value: string }) {
  const tone = success.includes(value) ? "success" : warning.includes(value) ? "warning" : danger.includes(value) ? "danger" : "";
  return <span className={`status ${tone}`}>{value.replaceAll("_", " ")}</span>;
}
