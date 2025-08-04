import { normalizeValidator } from "../src/Utils";

describe("normalizeValidator", () => {
    it("should return identity function for custom validator", () => {
        const validator = (x: unknown) => Number(x);
        const normalized = normalizeValidator("test", validator);
        expect(normalized("42")).toBe(42);
    });

    it("should handle primitive constructors", () => {
        const stringValidator = normalizeValidator("name", String);
        expect(stringValidator("hello")).toBe("hello");

        const numberValidator = normalizeValidator("age", Number);
        expect(() => { numberValidator("42"); }).toThrow(TypeError);

        const booleanValidator = normalizeValidator("flag", Boolean);
        expect(() => { booleanValidator(""); }).toThrow(TypeError);
    });

    it("should throw if primitive conversion fails", () => {
        const numberValidator = normalizeValidator("age", Number);
        expect(() => numberValidator("not a number")).toThrow(TypeError);
    });

    it("should handle array of validators", () => {
        const arrayValidator = normalizeValidator("list", [String]);
        expect(arrayValidator(["a", "b"])).toEqual(["a", "b"]);
    });

    it("should throw if array validator receives non-array", () => {
        const arrayValidator = normalizeValidator("list", [String]);
        expect(() => { arrayValidator("not an array"); }).toThrow(TypeError);
    });

    it("should throw on invalid validator", () => {
        expect(() => { normalizeValidator("bad", {}); }).toThrow(TypeError);
    });
});
