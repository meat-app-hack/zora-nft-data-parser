import bigInt, { BigInteger } from 'big-integer'

declare module 'big-integer' {
  interface BigInteger {
    exp10(decimals: number) : BigInteger;
  }
}

function from(units: BigInteger, decimals: number) {
  let f = trimRight(formatMoneyFull(units, decimals), '0');
  if (f[f.length - 1] === '.') {
    return f.slice(0, f.length - 1);
  }
  return f;
}

bigInt.prototype.exp10 =  function(decimals: number) {
  return this.multiply(bigInt(10).pow(decimals))
}

function trimRight(str: string, char: string) {
  while (str[str.length - 1] == char) str = str.slice(0, -1);
  return str;
}

function padLeft(str: string, len: number, char: string) {
  while (str.length < len) {
    str = char + str
  }
  return str;
}

function to(str: string, decimals: number) {
  if (!str) return bigInt.zero;
  var negative = str[0] === '-'
  if (negative) {
    str = str.slice(1)
  }
  var decimalIndex = str.indexOf('.')
  if (decimalIndex == -1) {
    if (negative) {
      return (bigInt(str)).multiply(bigInt(10).pow(decimals)).negate()
    }
    return (bigInt(str)).multiply(bigInt(10).pow(decimals))
  }
  if (decimalIndex + decimals + 1 < str.length) {
    str = str.substr(0, decimalIndex + decimals + 1)
  }
  if (negative) {
    return bigInt(str.substr(0, decimalIndex)).exp10(decimals)
      .add(bigInt(str.substr(decimalIndex + 1)).exp10(decimalIndex + decimals - str.length + 1)).negate()
  }
  return bigInt(str.substr(0, decimalIndex)).exp10(decimals)
    .add(bigInt(str.substr(decimalIndex + 1)).exp10(decimalIndex + decimals - str.length + 1))
}

function formatMoneyFull(v: BigInteger, decimals: number) {
  let units = v.toString();
  let symbol = units[0] === '-' ? '-' : ''
  if (symbol === '-') {
    units = units.slice(1);
  }
  let decimal;
  if (units.length >= decimals) {
    decimal = units.substr(units.length - decimals, decimals);
  } else {
    decimal = padLeft(units, decimals, '0')
  }
  return symbol + (units.substr(0, units.length - decimals) || '0') + '.' + decimal
}

export default {
  from, 
  to
}
