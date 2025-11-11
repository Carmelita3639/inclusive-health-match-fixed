import { SPECIALTY_TO_TAXONOMY } from "./specialtyTaxonomy";

export function parseUserQuery(input) {
  const text = (input || "").toLowerCase();

  let gender = "";
  if (/\bfemale\b|\bwoman\b/.test(text)) gender = "f";
  if (/\bmale\b|\bman\b/.test(text))     gender = "m";

  const specialties = Object.keys(SPECIALTY_TO_TAXONOMY);
  const specialtyHit = specialties.find(s => text.includes(s)) || "";

  const cultureTokens = [];
  if (/\bblack\b|\bafrican[-\s]?american\b/.test(text)) cultureTokens.push("black");
  if (/\blatino\b|\bhispanic\b/.test(text)) cultureTokens.push("latino");
  if (/\basian\b/.test(text)) cultureTokens.push("asian");
  if (/\bindigenous\b|\bnative\b/.test(text)) cultureTokens.push("indigenous");

  return {
    gender,
    taxonomy: specialtyHit ? SPECIALTY_TO_TAXONOMY[specialtyHit] : "",
    specialtyHit,
    cultureTokens
  };
}
