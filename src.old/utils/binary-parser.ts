import { Parser } from "binary-parser";

export class TypedParser<T extends {}> {
  parser = new Parser().endianness("big");

  bit1<TName extends string>(name: TName) {
    this.parser.bit1(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit2<TName extends string>(name: TName) {
    this.parser.bit2(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit3<TName extends string>(name: TName) {
    this.parser.bit3(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit4<TName extends string>(name: TName) {
    this.parser.bit4(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit5<TName extends string>(name: TName) {
    this.parser.bit5(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit6<TName extends string>(name: TName) {
    this.parser.bit6(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit7<TName extends string>(name: TName) {
    this.parser.bit7(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }
  bit8<TName extends string>(name: TName) {
    this.parser.bit8(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }

  int8<TName extends string>(name: TName) {
    this.parser.int8(name);
    return this as any as TypedParser<T & { [k in TName]: number }>;
  }

  parse(buffer: Buffer) {
    return this.parser.parse(buffer) as any as T;
  }
}

export function createBinaryParser() {
  return new TypedParser<{}>();
}
