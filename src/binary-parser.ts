import { Parser } from "binary-parser";

export type ParserReturn<T extends TypedParser<any>> = T extends TypedParser<
  infer U
>
  ? U
  : never;

export class TypedParser<T> {
  parser = new Parser().endianness("big");

  skipBit(x: number) {
    for (let i = 0; i < x; i++) {
      this.parser.bit1("__ignored__");
    }
    return this;
  }
  bit1<TName extends string>(
    name: TName
  ): TypedParser<T & { [k in TName]: number }> {
    this.parser.bit1(name);
    return this as any;
  }
  bit2<TName extends string>(
    name: TName
  ): TypedParser<T & { [k in TName]: number }> {
    this.parser.bit2(name);
    return this as any;
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
