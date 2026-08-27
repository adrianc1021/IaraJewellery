import { CheckoutForm } from "@/components/checkout-form";
export default function CheckoutPage() { return <main id="main" className="page-shell"><header className="page-heading container"><p className="eyebrow">SECURE CHECKOUT</p><h1>安全結帳</h1><p>聯絡資料、配送方式與付款。所有價格及庫存均由伺服器重新驗證。</p></header><div className="form-shell wide"><CheckoutForm /></div></main>; }
