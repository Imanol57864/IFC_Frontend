"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_RATES = { 1: "1", 2: "1" };
const RATE_FIELDS = [
  { id: 1, label: "MXN ➜ DLL" },
  { id: 2, label: "MXN ➜ EUR" }
];

export const CURRENCY_RATES_CHANGED_EVENT = "ifc:currency-rates-changed";

export default function CurrencyRateInputs({ userId }) {
  const storageKey = useMemo(() => `ifc:catalog:currency-rates:${userId}`, [userId]);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const cachedRates = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      setRates({
        1: validCachedRate(cachedRates?.[1]),
        2: validCachedRate(cachedRates?.[2])
      });
    } catch {
      setRates(DEFAULT_RATES);
    } finally {
      setRestored(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rates));
    } catch {
      // La conversión sigue funcionando aunque el navegador bloquee localStorage.
    }

    window.dispatchEvent(new CustomEvent(CURRENCY_RATES_CHANGED_EVENT));
  }, [rates, restored, storageKey]);

  function updateRate(id, value) {
    if (value !== "" && !/^\d*([.,]\d*)?$/.test(value)) return;
    setRates((current) => ({ ...current, [id]: value.replace(",", ".") }));
  }

  return (
    <div className="catalog-rate-strip" aria-label="Tipos de cambio guardados en este navegador">
      {RATE_FIELDS.map((field) => (
        <label className="metric" id={`estatico_${field.id}`} key={field.id}>
          <span>{field.label}</span>
          <span className="currency-rate-control">
            <span aria-hidden="true">$</span>
            <input
              aria-label={field.label}
              inputMode="decimal"
              min="1"
              step="0.01"
              type="number"
              value={rates[field.id]}
              onChange={(event) => updateRate(field.id, event.target.value)}
            />
          </span>
        </label>
      ))}
    </div>
  );
}

function validCachedRate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(value) : "1";
}
