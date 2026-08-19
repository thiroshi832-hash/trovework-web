/**
 * Pure helpers for the ID machine-readable-zone (MRZ) cross-check. Kept free of
 * the OCR/parse libraries so the extraction and comparison rules can be unit
 * tested directly. The provider does the OCR + `mrz` parse and hands the
 * checksum-validated fields here.
 *
 * The cross-check only ever makes the decision STRICTER: a mismatch on
 * checksum-valid data routes to manual review. A read we can't trust (no MRZ,
 * failed checksums) yields nothing and changes nothing.
 */

/** The fixed MRZ formats: line count × line length. */
const MRZ_FORMATS = [
  { lines: 3, len: 30 }, // TD1 (ID cards)
  { lines: 2, len: 36 }, // TD2
  { lines: 2, len: 44 }, // TD3 (passports)
];

/**
 * Finds the MRZ line block in raw OCR text, or null. Uppercases, strips spaces
 * (OCR loves to insert them), keeps only lines that are all MRZ characters at a
 * valid length, and returns the first consecutive run that fits a known format.
 */
export function findMrzLines(ocrText: string): string[] | null {
  const candidates = ocrText
    .toUpperCase()
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ""))
    .filter((l) => /^[A-Z0-9<]+$/.test(l) && [30, 36, 44].includes(l.length));

  for (const { lines, len } of MRZ_FORMATS) {
    for (let i = 0; i + lines <= candidates.length; i++) {
      const block = candidates.slice(i, i + lines);
      if (block.length === lines && block.every((l) => l.length === len)) return block;
    }
  }
  return null;
}

/** MRZ fields we compare against, once the parser has validated the checksums. */
export interface MrzFields {
  documentNumber?: string | null;
  /** YYMMDD, as MRZ stores it. */
  birthDate?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface EnteredDetails {
  idNumber: string;
  /** ISO YYYY-MM-DD from the form. */
  dob: string;
  fullName: string;
}

export interface MrzCrossCheck {
  dobMismatch: boolean;
  docMismatch: boolean;
  nameMismatch: boolean;
}

const alnum = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** ISO YYYY-MM-DD -> YYMMDD, or "" if it isn't a plain date. */
export function isoToYYMMDD(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  return m ? `${m[1].slice(2)}${m[2]}${m[3]}` : "";
}

/**
 * Compares checksum-valid MRZ fields to what the user typed. A field only
 * counts as a mismatch when BOTH sides are present and clearly differ — a field
 * the MRZ didn't carry never triggers a mismatch, so a partial read can't
 * punish an honest user.
 */
export function crossCheckMrz(fields: MrzFields, entered: EnteredDetails): MrzCrossCheck {
  const mrzDob = (fields.birthDate ?? "").replace(/\D/g, "");
  const enteredDob = isoToYYMMDD(entered.dob);
  const dobMismatch = mrzDob.length === 6 && enteredDob.length === 6 && mrzDob !== enteredDob;

  const mrzDoc = alnum(fields.documentNumber ?? "");
  const enteredDoc = alnum(entered.idNumber);
  const docMismatch = mrzDoc.length >= 4 && enteredDoc.length >= 4 && mrzDoc !== enteredDoc;

  // Name: does at least half of the entered surname/given tokens appear in the
  // MRZ names? Absent MRZ names -> not a mismatch.
  const mrzName = `${fields.firstName ?? ""} ${fields.lastName ?? ""}`.toUpperCase();
  const tokens = entered.fullName.toUpperCase().split(/\s+/).filter((t) => t.length >= 2);
  const nameMismatch =
    mrzName.trim().length > 0 &&
    tokens.length > 0 &&
    tokens.filter((t) => mrzName.includes(t)).length / tokens.length < 0.5;

  return { dobMismatch, docMismatch, nameMismatch };
}

/** True when the MRZ contradicts the entered details on any field. */
export function isDataMismatch(check: MrzCrossCheck): boolean {
  return check.dobMismatch || check.docMismatch || check.nameMismatch;
}
