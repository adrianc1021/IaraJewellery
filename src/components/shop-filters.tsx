"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";

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
  const [sortOpen, setSortOpen] = useState(false);
  const sortControlRef = useRef<HTMLDivElement>(null);
  const activeCount = Object.values(props.selected).reduce((total, values) => total + values.length, 0) + (props.priceMax ? 1 : 0);
  const currentSort = props.sortOptions.find((option) => option.value === props.sort) || props.sortOptions[0];

  function sortHref(value: string) {
    const params = new URLSearchParams();
    props.sortFields.forEach((field) => params.append(field.name, field.value));
    if (value !== "newest") params.set("sort", value);
    return `/shop${params.size ? `?${params.toString()}` : ""}`;
  }

  function chooseSort(value: string) {
    setSortOpen(false);
    window.setTimeout(() => { window.location.href = sortHref(value); }, 210);
  }

  useEffect(() => {
    document.body.classList.toggle("filter-drawer-open", open);
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); setSortOpen(false); }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("filter-drawer-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    function closeSort(event: PointerEvent) {
      if (!sortControlRef.current?.contains(event.target as Node)) setSortOpen(false);
    }
    document.addEventListener("pointerdown", closeSort);
    return () => document.removeEventListener("pointerdown", closeSort);
  }, []);

  return <>
    <div className="mobile-shop-actions">
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="shop-filter-drawer">
        <SlidersHorizontal size={15} />
        <span>{props.labels.filter}</span>
        {activeCount > 0 && <small aria-label={`${activeCount} ${props.labels.selected}`}>{activeCount}</small>}
      </button>
      <div className="mobile-sort-control" ref={sortControlRef}>
        <button className="mobile-sort-trigger" type="button" onClick={() => setSortOpen((value) => !value)} aria-expanded={sortOpen} aria-controls="mobile-sort-menu">
          <ArrowUpDown size={15} aria-hidden="true" />
          <span>{currentSort.label}</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>
        <div className={`mobile-sort-menu ${sortOpen ? "open" : ""}`} id="mobile-sort-menu" role="menu" aria-label={props.labels.sort}>
          <p>{props.labels.sort}</p>
          {props.sortOptions.map((option) => <button type="button" role="menuitemradio" aria-checked={props.sort === option.value} onClick={() => chooseSort(option.value)} key={option.value}>
            <span>{option.label}</span>
            {props.sort === option.value && <Check size={14} />}
          </button>)}
        </div>
      </div>
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
