import {
  crossCheckMrz,
  findMrzLines,
  isDataMismatch,
  isoToYYMMDD,
  type MrzFields,
} from "./mrz-check";

describe("findMrzLines", () => {
  it("pulls a 2×44 (TD3) block out of noisy OCR text", () => {
    const ocr = [
      "SPECIMEN  UTOPIA",
      "Name: ANNA MARIA",
      "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      "L898902C36UTO7408122F1204159ZE184226B<<<<<10",
      "signature",
    ].join("\n");
    const block = findMrzLines(ocr);
    expect(block).not.toBeNull();
    expect(block).toHaveLength(2);
    expect(block![0]).toMatch(/^P<UTO/);
  });

  it("tolerates spaces the OCR inserts", () => {
    const ocr = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C3 6UTO7408122F1204159ZE184226B<<<<<10";
    expect(findMrzLines(ocr)).not.toBeNull();
  });

  it("returns null when there is no MRZ", () => {
    expect(findMrzLines("Just a name and a date, nothing machine-readable.")).toBeNull();
  });
});

describe("isoToYYMMDD", () => {
  it("converts an ISO date", () => {
    expect(isoToYYMMDD("1990-04-12")).toBe("900412");
  });
  it("returns empty for a non-date", () => {
    expect(isoToYYMMDD("not-a-date")).toBe("");
  });
});

describe("crossCheckMrz", () => {
  const entered = { idNumber: "L898902C3", dob: "1974-08-12", fullName: "Anna Maria Eriksson" };
  const fields: MrzFields = {
    documentNumber: "L898902C3",
    birthDate: "740812",
    firstName: "ANNA MARIA",
    lastName: "ERIKSSON",
  };

  it("finds no mismatch when everything lines up", () => {
    expect(isDataMismatch(crossCheckMrz(fields, entered))).toBe(false);
  });

  it("flags a DOB mismatch", () => {
    const c = crossCheckMrz({ ...fields, birthDate: "800101" }, entered);
    expect(c.dobMismatch).toBe(true);
    expect(isDataMismatch(c)).toBe(true);
  });

  it("flags a document-number mismatch", () => {
    const c = crossCheckMrz({ ...fields, documentNumber: "ZZ999999" }, entered);
    expect(c.docMismatch).toBe(true);
  });

  it("flags a name mismatch", () => {
    const c = crossCheckMrz({ ...fields, firstName: "JOHN", lastName: "SMITH" }, entered);
    expect(c.nameMismatch).toBe(true);
  });

  it("does NOT flag fields the MRZ didn't carry", () => {
    const c = crossCheckMrz({ birthDate: null, documentNumber: null, firstName: null, lastName: null }, entered);
    expect(isDataMismatch(c)).toBe(false);
  });
});
