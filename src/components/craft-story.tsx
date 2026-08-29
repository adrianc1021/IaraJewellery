"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const craftSteps = [
  {
    number: "01",
    label: "SELECT",
    titleZh: "寶石甄選",
    titleEn: "Stone selection",
    descriptionZh: "從色澤、淨度到比例，尋找最合適的光。",
    descriptionEn: "From colour and clarity to proportion, we seek the stone that holds light most beautifully.",
    image: "/images/craft/stone-selection.jpg",
    position: "center 48%"
  },
  {
    number: "02",
    label: "SET",
    titleZh: "手工鑲嵌",
    titleEn: "Hand setting",
    descriptionZh: "逐石定位，讓每個切面準確承接光線。",
    descriptionEn: "Each stone is positioned by hand so every facet meets the light with precision.",
    image: "/images/craft/hand-setting.jpg",
    position: "center 42%"
  },
  {
    number: "03",
    label: "FINISH",
    titleZh: "拋光與檢驗",
    titleEn: "Polish and inspection",
    descriptionZh: "反覆修整每一道弧度，直至觸感自然貼膚。",
    descriptionEn: "Every curve is refined and inspected until the finished piece rests naturally against the skin.",
    image: "/images/craft/polish-inspection.jpg",
    position: "center 48%"
  }
];

export function CraftStory({ locale }: { locale: Locale }) {
  const [activeStep, setActiveStep] = useState(0);
  const en = locale === "en";

  return (
    <section className="craft-story" id="story">
      <div className="craft-story-copy">
        <header className="craft-story-heading reveal-item">
          <p className="eyebrow">THE ART OF IARA</p>
          <h2>
            {en ? <><span>Every light is shaped</span><span>by hand.</span></> : <><span>每一道光，</span><span>都由雙手成就。</span></>}
          </h2>
        </header>

        <div className="craft-story-mobile-hero">
          <Image
            src={craftSteps[0].image}
            alt={en ? "A close view of jewellery craftsmanship" : "珠寶工藝近鏡"}
            fill
            sizes="100vw"
          />
          <span>{en ? "The making of Iara" : "IARA 作品誕生的過程"}</span>
        </div>

        <p className="craft-story-intro reveal-item">
          {en
            ? "Every piece is carefully made in our Hong Kong atelier. From stone selection and hand setting to the final polish, each curve is repeatedly calibrated so the jewellery rests naturally on the skin and catches the light just as intended."
            : "每件作品皆於香港工房細緻製作。從寶石甄選、手工鑲嵌到最後拋光，我們反覆校準每一道弧度，讓珠寶自然貼合肌膚，也讓光線恰到好處地被看見。"}
        </p>

        <div className="craft-story-steps reveal-item">
          {craftSteps.map((step, index) => (
            <button
              className={index === activeStep ? "active" : undefined}
              type="button"
              key={step.number}
              aria-pressed={index === activeStep}
              onPointerEnter={() => setActiveStep(index)}
              onFocus={() => setActiveStep(index)}
              onClick={() => setActiveStep(index)}
            >
              <span className="craft-step-number">{step.number}</span>
              <span className="craft-step-copy">
                <small>{step.label}</small>
                <strong>{en ? step.titleEn : step.titleZh}</strong>
                <em>{en ? step.descriptionEn : step.descriptionZh}</em>
              </span>
              <span className="craft-step-image">
                <Image
                  src={step.image}
                  alt={en ? step.titleEn : step.titleZh}
                  fill
                  sizes="(max-width: 680px) calc(100vw - 40px), 1px"
                  style={{ objectPosition: step.position }}
                />
              </span>
            </button>
          ))}
        </div>

        <Link className="craft-story-cta reveal-item" href="/journal">
          <span>{en ? "Explore the making of Iara" : "探索 IARA 的製作工藝"}</span>
          <i aria-hidden="true" />
          <ArrowRight size={16} strokeWidth={1.4} />
        </Link>
      </div>

      <div className="craft-story-visual" aria-live="polite">
        {craftSteps.map((step, index) => (
          <Image
            className={index === activeStep ? "active" : undefined}
            src={step.image}
            alt={index === activeStep ? (en ? step.titleEn : step.titleZh) : ""}
            aria-hidden={index !== activeStep}
            fill
            key={step.number}
            sizes="(max-width: 1000px) 54vw, 620px"
            style={{ objectPosition: step.position }}
          />
        ))}
        <div className="craft-story-visual-shade" />
        <span className="craft-story-visual-index">{craftSteps[activeStep].number} / 03</span>
        <span className="craft-story-visual-caption">
          <small>{craftSteps[activeStep].label}</small>
          {en ? craftSteps[activeStep].titleEn : craftSteps[activeStep].titleZh}
        </span>
      </div>
    </section>
  );
}
