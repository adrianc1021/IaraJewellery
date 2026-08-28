"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpDown, ChevronDown, SlidersHorizontal, X } from "lucide-react";

export type ShopFilterGroup = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

type HiddenField = { name: string; value: string };
type PriceOption = { value: string; label: string };

type SharedProps = {
  filters: ShopFilterGroup[];
  hiddenFields: HiddenField[];
  selected: Record<string, string[]>;
  priceOptions: PriceOption[];
  priceMax: number;
  clearHref: string;
  labels: {
    filter: string;
    filters: string;
    sort: string;
    close: string;
    clear: string;
    apply: string;
    selected: string;
    price: string;
  };
};

function HiddenFields({ fields }: { fields: HiddenField[] }) {
  return <>{fields.map((field, index) => <input key={`${field.name}-${field.value}-${index}`} type="hidden" name={field.name} value={field.value} />)}</>;
}

function FilterFields({ filters, selected, priceOptions, priceMax, priceLabel, openFirst = false }: Pick<SharedProps, "filters" | "selected" | "priceOptions" | "priceMax"> & { priceLabel: string; openFirst?: boolean }) {
  const groups = [...filters, { key: "priceMax", label: priceLabel, options: priceOptions }];
  return <div className="shop-filter-groups">
    {groups.map((filter, index) => {
      const selectedCount = filter.key === "priceMax" ? (priceMax ? 1 : 0) : (selected[filter.key]?.length || 0);
      return <details key={filter.key} open={openFirst && index === 0}>
        <summary>
          <span>{filter.label}</span>
          <span>{selectedCount > 0 && <small>{selectedCount}</small>}<ChevronDown size={15} /></span>
        </summary>
        <div className="shop-filter-options">
          {filter.options.map((option) => <label key={option.value}>
            <input
              type={filter.key === "priceMax" ? "radio" : "checkbox"}
              name={filter.key}
              value={option.value}
              defaultChecked={filter.key === "priceMax" ? priceMax === Number(option.value) : selected[filter.key]?.includes(option.value)}
            />
            <span>{option.label}</span>
          </label>)}
        </div>
      </details>;
    })}
  </div>;
}

export function ShopFilterSidebar(props: SharedProps) {
  return <form className="filter-sidebar" action="/shop">
    <HiddenFields fields={props.hiddenFields} />
    <div className="filter-sidebar-heading">
      <span><SlidersHorizontal size={15} />{props.labels.filters}</span>
      <Link href={props.clearHref}>{props.labels.clear}</Link>
    </div>
    <FilterFields filters={props.filters} selected={props.selected} priceOptions={props.priceOptions} priceMax={props.priceMax} priceLabel={props.labels.price} openFirst />
    <button className="button button-primary" type="submit">{props.labels.apply}</button>
  </form>;
}

export function MobileShopFilters(props: SharedProps & { sort: string; sortFields: HiddenField[]; sortOptions: PriceOption[] }) {
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(props.selected).reduce((total, values) => total + values.length, 0) + (props.priceMax ? 1 : 0);

  useEffect(() => {
    document.body.classList.toggle("filter-drawer-open", open);
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("filter-drawer-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    <div className="mobile-shop-actions">
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="shop-filter-drawer">
        <SlidersHorizontal size={15} />
        <span>{props.labels.filter}</span>
        {activeCount > 0 && <small aria-label={`${activeCount} ${props.labels.selected}`}>{activeCount}</small>}
      </button>
      <form action="/shop">
        <HiddenFields fields={props.sortFields} />
        <ArrowUpDown size={15} aria-hidden="true" />
        <label className="sr-only" htmlFor="mobile-shop-sort">{props.labels.sort}</label>
        <select id="mobile-shop-sort" name="sort" defaultValue={props.sort} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
          {props.sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </form>
    </div>

    <div className={`shop-filter-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <button className="shop-filter-backdrop" type="button" aria-label={props.labels.close} onClick={() => setOpen(false)} />
      <section id="shop-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-filter-title">
        <header>
          <div>
            <p className="eyebrow">IARA SELECTION</p>
            <h2 id="shop-filter-title">{props.labels.filters}</h2>
          </div>
          <button className="icon-button" type="button" aria-label={props.labels.close} onClick={() => setOpen(false)}><X size={20} /></button>
        </header>
        <form action="/shop">
          <HiddenFields fields={props.hiddenFields} />
          <FilterFields filters={props.filters} selected={props.selected} priceOptions={props.priceOptions} priceMax={props.priceMax} priceLabel={props.labels.price} openFirst />
          <footer>
            <Link href={props.clearHref}>{props.labels.clear}</Link>
            <button className="button button-primary" type="submit">{props.labels.apply}</button>
          </footer>
        </form>
      </section>
    </div>
  </>;
}
