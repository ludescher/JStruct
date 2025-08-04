import { normalizeValidator } from "../src/Utils";

describe("normalizeValidator", () => {
    it("should return identity function for custom validator", () => {
        const validator = (x: unknown) => Number(x);
        const normalized = normalizeValidator("test", validator);
        expect(normalized("42")).toBe(42);
    });

    it("should validate using primitive constructors and throw on invalid input", () => {
        const stringValidator = normalizeValidator("name", String);
        expect(stringValidator("hello")).toBe("hello");

        const numberValidator = normalizeValidator("age", Number);
        expect(() => { numberValidator("42"); }).toThrow(TypeError);

        const booleanValidator = normalizeValidator("flag", Boolean);
        expect(() => { booleanValidator(""); }).toThrow(TypeError);
    });

    it("should correctly coerce falsy values with Boolean validator", () => {
        const boolValidator = normalizeValidator("flag", Boolean);
        expect(() => { boolValidator(" "); }).toThrow(TypeError);
        expect(() => { boolValidator("non-empty"); }).toThrow(TypeError);
    });

    it("should throw TypeError when primitive conversion fails", () => {
        const numberValidator = normalizeValidator("age", Number);
        expect(() => numberValidator("not a number")).toThrow(TypeError);
    });

    it("should validate arrays using single-element validator", () => {
        const arrayValidator = normalizeValidator("list", [String]);
        expect(arrayValidator(["a", "b"])).toEqual(["a", "b"]);
    });

    it("should throw if array validator receives a non-array value", () => {
        const arrayValidator = normalizeValidator("list", [String]);
        expect(() => { arrayValidator("not an array"); }).toThrow(TypeError);
    });

    it("should allow empty array for array validator", () => {
        const arrayValidator = normalizeValidator("list", [String]);
        expect(arrayValidator([])).toEqual([]);
    });

    it("should allow empty array for array validator", () => {
        const arrayValidator = normalizeValidator("tags", [String]);
        expect(arrayValidator([])).toEqual([]);
    });

    it("should throw TypeError for unsupported validator types (e.g., object)", () => {
        expect(() => { normalizeValidator("bad", {}); }).toThrow(TypeError);
    });
});
