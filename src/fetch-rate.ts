import axios from 'axios';

const BASE_URL = 'https://min-api.cryptocompare.com/data';
const API_KEY = process.env.CRYPTOCOMPARE_SECRET_API;

export type Rate = {
  USD: number | null,
  currency: string | null
}

let price: Rate = {
  USD: null,
  currency: null
};

let cache:any = {

}

export async function fetchRate(currency: any): Promise<Rate> {
  try {
    currency = currency.toUpperCase()
    if (cache.currency) {
      return cache.currency
    }
    const { data } = await axios.get(
      `${BASE_URL}/price?fsym=${currency.toUpperCase()}&tsyms=USD&extraParams=${API_KEY}`
    ) as any;
    price.USD = data.USD;
    price.currency = currency
    cache[currency] = price
      
    return price
  } catch (exc) {
    console.log(exc);
  } finally {
    return price;
  }
}