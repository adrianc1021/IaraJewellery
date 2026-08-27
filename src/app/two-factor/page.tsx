import { TwoFactorChallenge } from "@/components/two-factor-challenge";

export default function TwoFactorPage() {
  return <main id="main" className="form-shell auth-standalone">
    <p className="eyebrow">SECURE SIGN IN</p>
    <h1>確認你的身份</h1>
    <p>輸入驗證器產生的代碼，或使用一組未使用的後備碼。</p>
    <TwoFactorChallenge />
  </main>;
}
