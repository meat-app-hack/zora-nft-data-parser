import path from 'path'
import { createObjectCsvWriter } from 'csv-writer'

const csvWriter = createObjectCsvWriter({
  path: path.resolve(__dirname, '../set/', `${+Date.now()}_set.csv`),
  header: [
    { id: 'id', title: '#' },
    { id: 'name', title: 'NAME' },
    { id: 'bid', title: 'MAX BID (USD)' },
    { id: 'url', title: 'URL' },
    { id: 'hash', title: 'HASH' }
  ]
})

export async function writeSingleRecord(id: number, name: string, bid: number, url: string, hash: string) {
  return await csvWriter.writeRecords([{ id, name, bid, url, hash }])
}