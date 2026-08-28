"use client";
import { Search, X } from "lucide-react";
import { FormEvent, useState } from "react";
export function OpsSearch({ placeholder = "搜尋…", value = "" }: { placeholder?: string; value?: string }) {
  const [query, setQuery] = useState(value);
  function submit(event: FormEvent) { event.preventDefault(); const params = new URLSearchParams(window.location.search); if (query.trim()) params.set("q", query.trim()); else params.delete("q"); window.location.search = params.toString(); }
  function clear() { setQuery(""); const params = new URLSearchParams(window.location.search); params.delete("q"); window.location.search = params.toString(); }
  return <form className="ops-search" onSubmit={submit} role="search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />{query && <button type="button" onClick={clear} aria-label="清除搜尋"><X size={14} /></button>}<button className="button button-secondary" type="submit">搜尋</button></form>;
}
