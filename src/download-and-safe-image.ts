import fs from 'fs'  
import path from 'path' 
import axios from 'axios'

export async function downloadAndSafeImage(name: string, url:string) {  
  const p = path.resolve(__dirname, '../set/images', `${name}.jpg`)
  const writer = fs.createWriteStream(p)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  //@ts-ignore
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}
