import { TwoFactorChallenge } from "@/components/two-factor-challenge";
import { getLocale } from "@/lib/i18n";

export default async function TwoFactorPage() {
  const locale = await getLocale();
  const en = locale === "en";
  return <main id="main" className="form-shell auth-standalone">
    <p className="eyebrow">SECURE SIGN IN</p>
    <h1>{en ? "Confirm your identity" : "確認你的身份"}</h1>
    <p>{en ? "Enter the code from your authenticator, or use an unused backup code." : "輸入驗證器產生的代碼，或使用一組未使用的後備碼。"}</p>
    <TwoFactorChallenge locale={locale} />
  </main>;
}
