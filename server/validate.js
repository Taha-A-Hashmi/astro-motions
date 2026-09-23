/* ═══════════════════════════════════════════════════════════════════════
   server/validate.js — the contact payload, checked server-side.
   Mirrors the client rules so the API is safe to hit directly.

   Every field is required: first name, last name, email, country (one of
   cms/countries.js), phone, and a description of at least 10 characters.
   ═══════════════════════════════════════════════════════════════════════ */
import { COUNTRIES } from '../cms/countries.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// digits with the usual separators, an optional leading +
const PHONE_RE = /^\+?[0-9\s().\-]{6,24}$/;
const COUNTRY_SET = new Set(COUNTRIES);

const clean = (v, max) =>
  String(v ?? '')
    .replace(/[​-‍﻿]/g, '') // zero-width junk
    .trim()
    .slice(0, max);

/**
 * @returns {{ ok: true, data: object } | { ok: false, errors: Record<string,string> }}
 */
export function validateInquiry(body) {
  const errors = {};
  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 160).toLowerCase();
  const country = clean(body.country, 80);
  const phone = clean(body.phone, 30);
  const message = clean(body.message, 4000);
  const digits = phone.replace(/\D/g, '').length;

  if (!firstName) errors.firstName = 'Please enter your first name';
  if (!lastName) errors.lastName = 'Please enter your last name';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (!COUNTRY_SET.has(country)) errors.country = 'Please choose your country';
  if (!PHONE_RE.test(phone) || digits < 6 || digits > 15) errors.phone = 'Enter a valid phone number';
  if (message.length < 10) errors.message = 'Please write at least 10 characters';

  // Crude link-spam guard: real briefs rarely contain more than 3 URLs
  if ((message.match(/https?:\/\//gi) || []).length > 3) errors.message = 'Too many links';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { firstName, lastName, name: `${firstName} ${lastName}`, email, country, phone, message },
  };
}
