A lightweight, type-safe, and immutable data structure utility for JavaScript and TypeScript.  
Built around a single abstract class `Struct`, this package allows you to define strict, validated, and readonly objects with minimal boilerplate.

---

## 🚀 Features

- ✅ Type-safe object construction
- ✅ Custom validators for each field
- ✅ Automatic default values
- ✅ Immutable and readonly instances
- ✅ Clear error messages for invalid input

---

## 📦 Installation

```bash
npm install @ludeschersoftware/struct
```

---

## 🧠 Concept

The core idea is to define a subclass of `Struct`, specify default values and validators, and use the `.of()` method to create validated instances.

Only the `Struct` class is exposed publicly—it's the default export of the package.

---

## 🛠️ Basic Usage

### 1. Define Your Struct

```ts
import Struct from "@ludeschersoftware/struct";

class SoilStruct extends Struct {
  public row!: number;
  public topf!: string;
  public woche!: number;
  public amount!: number;

  private constructor() {
    super();
  }

  public static of(data: Partial<SoilStruct> = {}) {
    return this.create<SoilStruct>(
      {
        row: 0,
        topf: "",
        woche: 0,
        amount: 0,
      },
      {
        row: (raw: any) =>
          typeof raw === "number"
            ? raw
            : (() => {
                throw new TypeError("row must be a number");
              })(),
        topf: (raw: any) =>
          typeof raw === "string"
            ? raw
            : (() => {
                throw new TypeError("topf must be a string");
              })(),
        woche: (raw: any) =>
          typeof raw === "number"
            ? raw
            : (() => {
                throw new TypeError("woche must be a number");
              })(),
        amount: (raw: any) =>
          typeof raw === "number"
            ? raw
            : (() => {
                throw new TypeError("amount must be a number");
              })(),
      },
      data
    );
  }
}
```

---

### 2. Create an Instance

```ts
const soil = SoilStruct.of({
  row: 5,
  topf: "A3",
  woche: 28,
  amount: 120,
});

console.log(soil.row); // 5
console.log(soil.topf); // "A3"
```

---

### 3. Immutability & Validation

```ts
soil.row = 10; // ✅ Allowed: row is a defined field with a validator
soil.newField = "oops"; // ❌ Throws: Cannot add new property
soil.amount = "high"; // ❌ Throws: amount must be a number
```

---

## 🧪 Validator Syntax

You can use:

- Primitive constructors: `String`, `Number`, `Boolean`
- Custom functions: `(x: unknown) => T`
- Arrays of validators: `[String]` for arrays of strings

### Example:

```ts
{
    name: String,
    tags: [String],
    active: Boolean,
    age: (x) => {
        if (typeof x !== "number" || x < 0) throw new TypeError("Invalid age");
        return x;
    }
}
```

---

## 🔒 Struct Behavior

The returned object is a generic object with getter|setter's that enforces:

- Field existence
- Type validation on assignment
- Readonly structure (no new fields, no deletion)
- Prevents extensions and prototype manipulation
- Only data properties are allowed, methods are disallowed. For helper logic, use static functions or external utility classes.

---

## 🧬 Advanced Features

### `instanceof` Support

Structs created via `.of()` behave like native class instances:

```ts
const soil = SoilStruct.of();
soil instanceof SoilStruct; // ✅ true
```

This is achieved by dynamically patching the class's `Symbol.hasInstance` method. It ensures that `instanceof` checks work correctly even though instances are constructed via a static factory method.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests under `tests/`
4. Submit a PR

---

## License

MIT © Johannes Ludescher
