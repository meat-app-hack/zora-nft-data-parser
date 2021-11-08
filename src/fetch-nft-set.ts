import 'isomorphic-unfetch'
import bigInt from 'big-integer'
import axios from 'axios'
import { createClient } from 'urql'
import { writeSingleRecord } from './csv-writer'
import sanitize from 'sanitize-filename'
import { downloadAndSafeImage } from './download-and-safe-image'
import { fetchRate  } from './fetch-rate'
import satoshi from './satoshi'

const client = createClient({
  url: 'https://api.thegraph.com/subgraphs/name/ourzora/zora-v1'
})

// replace IPFS URL with cloudinary link
function replaceWithCloudflareCDN(ipfsURL:string) {
  return ipfsURL.replace(/ipfs.fleek.co/, 'cloudflare-ipfs.com')
}

const query = (lastId: number, first: number) => `
  query {
    tokens: medias(
      first: ${first}
      where: { id_gt: ${lastId}  }
    ) {
      id
      transactionHash
      contentHash
      contentURI
      metadataURI
      inactiveBids (
        orderBy: createdAtTimestamp
        orderDirection: desc
      ) {
        currency {
          decimals
          symbol
          name
        }
        amount
  
        createdAtTimestamp
        createdAtBlockNumber  
      } 
      currentBids (
        orderBy: createdAtTimestamp
        orderDirection: desc
      ) {
        currency {
          decimals
          symbol
          name
        }
        amount
  
        createdAtTimestamp
        createdAtBlockNumber  
      } 
    }
  }
`

async function fetchData(lastId: number, first: number) {
  return await client
  .query(query(lastId, first))
  .toPromise()
  .then(async (result: any) => {
    let last = lastId  
     
    for(let i = 0; i < result.data.tokens.length; ++i) {
      try {
        console.log(lastId + i)
        const token = result.data.tokens[i]
        const url = replaceWithCloudflareCDN(token.metadataURI)

        const { data: meta } =  await axios({
          url,
          timeout: 1000,
          method: 'get'
        }) as any
        const isImage = meta.mimeType && (meta.mimeType === 'image/jpeg' || meta.mimeType === 'image/png' || meta.mimeType === 'image/jpg')
        if (isImage) {
          token.mimeType = meta.mimeType

          const bids = [...(token.inactiveBids || []), ...(token.currentBids || [])]
          let priceUsd = 0

          if (bids.length !== 0) {
            
            for (let i = 0; i < bids.length; ++i) {
              const bid = bids[i]

              const { USD } = await fetchRate(bid.currency.symbol)
              const decimals = bid.currency.decimals 
              const amountsat = bigInt(bid.amount)
              const amountBtc = parseFloat(satoshi.from(amountsat, decimals))
              const usd = (USD || 0) * amountBtc

              if (priceUsd < usd)
                priceUsd = usd
            }
          }

          const name = sanitize(meta.name || token.id)

          //const { USD } = await fetchRate(token.currency.symbol)
          try {
            await downloadAndSafeImage(name, token.contentURI)
            await writeSingleRecord(token.id, name, priceUsd, token.contentURI, token.transactionHash)
          }
          catch (exc) {

          }

          last = parseInt(token.id || (lastId + i))
        }
      }
      catch (exc) {
        console.log(exc)
      }
    }
    return last
  })
}


async function start() {
  let last = 4348
  const step = 300
  let i = 1;
  while (last !== -1) {
    last = await fetchData(last, step * i)
    console.log(last)
    ++i
  }
}

export {
  start
}