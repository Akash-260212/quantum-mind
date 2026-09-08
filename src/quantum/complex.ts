/**
 * Complex Number Math Engine for Quantum State Simulation
 */
export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re: number = 0, im: number = 0) {
    this.re = Math.abs(re) < 1e-12 ? 0 : re;
    this.im = Math.abs(im) < 1e-12 ? 0 : im;
  }

  static readonly ZERO = new Complex(0, 0);
  static readonly ONE = new Complex(1, 0);
  static readonly I = new Complex(0, 1);

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  scale(scalar: number): Complex {
    return new Complex(this.re * scalar, this.im * scalar);
  }

  div(other: Complex): Complex {
    const denom = other.re * other.re + other.im * other.im;
    if (denom === 0) throw new Error("Division by zero in Complex arithmetic");
    return new Complex(
      (this.re * other.re + this.im * other.im) / denom,
      (this.im * other.re - this.re * other.im) / denom
    );
  }

  conj(): Complex {
    return new Complex(this.re, -this.im);
  }

  magnitudeSquared(): number {
    return this.re * this.re + this.im * this.im;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  phase(): number {
    return Math.atan2(this.im, this.re);
  }

  static fromPolar(r: number, theta: number): Complex {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  format(precision: number = 3): string {
    const r = Math.abs(this.re) < 1e-6 ? 0 : Number(this.re.toFixed(precision));
    const i = Math.abs(this.im) < 1e-6 ? 0 : Number(this.im.toFixed(precision));

    if (i === 0) return `${r}`;
    if (r === 0) {
      if (i === 1) return 'i';
      if (i === -1) return '-i';
      return `${i}i`;
    }
    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    const iStr = absI === 1 ? 'i' : `${absI}i`;
    return `${r} ${sign} ${iStr}`;
  }
}
