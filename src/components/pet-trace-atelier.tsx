"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type PetProduct = {
  slug: string;
  nameZh: string;
  nameEn?: string;
  material?: string;
};

const storyImages = {
  paw: {
    relation: "/images/pet-trace/paw-story.jpg",
    detail: "/images/pet-trace/paw-detail.jpg"
  },
  nose: {
    relation: "/images/pet-trace/nose-story.jpg",
    detail: "/images/pet-trace/nose-detail.jpg"
  }
};

const processSteps = [
  { number: "01", titleZh: "選擇印記", titleEn: "Choose the trace", copyZh: "選擇毛孩的肉球或鼻紋，以及希望訂製的珠寶款式。", copyEn: "Choose a paw or nose impression, then select the form of jewellery you want to create." },
  { number: "02", titleZh: "留下印模", titleEn: "Take the impression", copyZh: "透過專屬印模，保存牠真實的輪廓與紋理。", copyEn: "A dedicated impression captures the real contours and texture of their trace." },
  { number: "03", titleZh: "轉化設計", titleEn: "Shape the design", copyZh: "設計師整理印記細節，將原始痕跡轉化成適合佩戴的形態。", copyEn: "Our designer refines the original trace into a form made to be worn." },
  { number: "04", titleZh: "手工製作", titleEn: "Make by hand", copyZh: "作品經塑形、製作、修整與拋光，成為一件只屬於你們的珠寶。", copyEn: "The piece is formed, finished and polished by hand into something uniquely yours." }
];

function StoryCard({ type, locale, product }: { type: "paw" | "nose"; locale: Locale; product?: PetProduct }) {
  const [showDetail, setShowDetail] = useState(false);
  const en = locale === "en";
  const paw = type === "paw";
  const images = paw ? storyImages.paw : storyImages.nose;
  const productName = paw ? (en ? "Marea Paw Impression Pendant" : "Marea 的肉球印記吊墜") : (en ? "Luna Nose Impression Disc" : "Luna 的鼻紋印記圓牌");
  const productMaterial = product?.material;
  const relationAlt = paw ? (en ? "A wearer with their companion beside a bespoke paw impression pendant" : "主人佩戴肉球印記訂製吊墜，毛孩自然靠在身旁") : (en ? "A bespoke nose impression pendant held in a wearer's hand" : "主人手中展示由鼻紋轉化而成的訂製圓牌珠寶");
  const detailAlt = paw ? (en ? "Close detail of the paw impression jewellery surface" : "肉球印記訂製珠寶的紋理細節") : (en ? "Close detail of an irregular nose impression on a metal pendant" : "鼻紋印記金屬圓牌及吊鏈的微距細節");

  return <article className={`trace-story-card ${paw ? "trace-story-card-large" : "trace-story-card-small"}`} onMouseEnter={() => setShowDetail(true)} onMouseLeave={() => setShowDetail(false)}>
    <button className="trace-card-image" type="button" aria-label={en ? `View ${productName} detail` : `查看${productName}細節`} onClick={() => setShowDetail(!showDetail)}>
      <Image className={!showDetail ? "active" : undefined} src={images.relation} alt={relationAlt} fill sizes="(max-width: 680px) calc(100vw - 40px), 58vw" />
      <Image className={showDetail ? "active" : undefined} src={images.detail} alt={showDetail ? detailAlt : ""} fill sizes="(max-width: 680px) calc(100vw - 40px), 58vw" aria-hidden={!showDetail} />
      <span className="trace-card-overlay" />
      <span className="trace-card-state">{showDetail ? (en ? "DETAIL VIEW" : "印記細節") : (en ? "THE RELATIONSHIP" : "陪伴之間")}</span>
      <Heart className="trace-card-heart" size={18} strokeWidth={1.3} aria-hidden="true" />
    </button>
    <div className="trace-card-copy">
      <p className="trace-card-label">{paw ? "PAW IMPRESSION" : "NOSE IMPRESSION"}</p>
      <h3>{productName}</h3>
      <p>{paw ? (en ? "Taken from Marea's real paw impression, preserving each quiet variation in its texture." : "取自 Marea 的真實肉球印模，保留每一道深淺不一的細小紋理。") : (en ? "Taken from Luna's one-of-a-kind nose print, a familiar touch translated into a piece to wear." : "取自 Luna 獨一無二的鼻紋，將熟悉的觸感轉化成可以佩戴的痕跡。")}</p>
      <span>{en ? "Bespoke · Material shown from product data" : `專屬訂製 · ${productMaterial || "材質按實際商品資料顯示"}`}</span>
      {product && <Link className="trace-card-link" href={`/product/${product.slug}`}>{en ? "View the piece" : "查看作品"}<ArrowRight size={13} /></Link>}
    </div>
  </article>;
}

export function PetTraceAtelier({ locale, petProducts }: { locale: Locale; petProducts: PetProduct[] }) {
  const en = locale === "en";
  const pawProduct = petProducts.find((product) => /marea/i.test(product.slug) || /marea/i.test(product.nameEn || ""));
  const noseProduct = petProducts.find((product) => /luna/i.test(product.slug) || /luna/i.test(product.nameEn || ""));

  return <section className="trace-atelier" id="pet-trace">
    <div className="trace-atelier-intro">
      <div className="trace-atelier-title reveal-item"><p className="eyebrow">A TRACE OF YOU</p><h2>{en ? <><span>Keep their trace,</span><span>closest to your heart.</span></> : <><span>把牠的印記，</span><span>留在離心最近的位置。</span></>}</h2></div>
      <div className="trace-atelier-description reveal-item"><p>{en ? "Every paw texture and every nose print records a trace that belongs only to them." : "每一道肉球紋理、每一枚鼻印，都記錄著只屬於牠的痕跡。"}</p><p>{en ? "We preserve that real trace through a dedicated impression, then let our artisans translate it into jewellery you can wear every day. Whether they are beside you or living in memory, the bond can still be touched." : "我們以專屬印模保存毛孩真實留下的紋理，再由工匠轉化成可以每天佩戴的珠寶。無論牠正在身旁，或已住進回憶裡，這份陪伴，都可以繼續被觸碰。"}</p></div>
      <Link className="trace-atelier-primary-cta reveal-item" href="/appointment"><span>{en ? "Explore bespoke impressions" : "探索印記訂製"}</span><i /><ArrowRight size={15} /></Link>
    </div>

    <div className="trace-stories">
      <header className="trace-section-heading reveal-item"><p className="eyebrow">THEIR STORIES</p><h3>{en ? "The traces they leave" : "牠們留下的印記"}</h3><p>{en ? "Every piece begins with a real story of companionship." : "每一件作品，都來自一段真實的陪伴。"}</p></header>
      <div className="trace-story-grid"><StoryCard type="paw" locale={locale} product={pawProduct} /><StoryCard type="nose" locale={locale} product={noseProduct} /></div>
    </div>

    <div className="trace-process">
      <header className="trace-section-heading reveal-item"><p className="eyebrow">FROM IMPRESSION TO JEWEL</p><h3>{en ? "From impression to jewel" : "由印記，到珠寶"}</h3></header>
      <div className="trace-process-grid">{processSteps.map((step, index) => <div className="trace-process-step reveal-item" key={step.number}><span>{step.number}</span><div><h4>{en ? step.titleEn : step.titleZh}</h4><p>{en ? step.copyEn : step.copyZh}</p></div>{index < processSteps.length - 1 && <i aria-hidden="true" />}</div>)}</div>
      <Link className="trace-process-cta text-link" href="/appointment">{en ? "Learn how to leave a trace" : "了解如何留下印記"}<ArrowRight size={13} /></Link>
    </div>

    <div className="trace-atelier-close reveal-item"><p className="eyebrow">MADE FROM A REAL TRACE</p><h3>{en ? <>They have left an irreplaceable place<br />in your life. Let the trace remain.</> : <>牠已經在你的生命裡，<br />留下無可取代的位置。<br /><span>現在，把這份痕跡留低。</span></>}</h3><div><Link className="trace-start-button" href="/appointment">{en ? "Begin your bespoke piece" : "開始訂製"}</Link><Link className="trace-close-link" href="/appointment">{en ? "Arrange a consultation" : "預約了解訂製服務"}<ArrowRight size={13} /></Link></div></div>
  </section>;
}
