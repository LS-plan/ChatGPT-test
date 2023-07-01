import axios from 'axios';
import 'dotenv/config';
import { createReadStream } from 'fs';
import { createServer } from "http";
import { Stream } from 'stream';

const api = axios.create({
    // baseURL: 'https://api.openai.com/v1',
    baseURL: 'https://openai-api.ikechan8370.com/v1',
    headers: {
        Library: 'Venti',
        Authorization : `Bearer ${process.env.OPENAI_API_KEY}`
    },
    // httpsAgent: new SocksProxyAgent(process.env.SOCKS_PROXY!)
})

createServer(async (req, res) => {
    const url = new URL(req.url!, 'fill:///')
    const pathname = url.pathname;
    const query = Object.fromEntries(url.searchParams.entries())
    console.log(query)
    switch(pathname) {
        case '/':
            createReadStream('./index.html').pipe(res)
            break;
        case '/chat':
            res.setHeader('Content-Type', 'text/event-stream')
            if(query.prompt == null){
                req.statusCode = 400
                return res.end(JSON.stringify({
                    message: '请输入提问内容'
                }))
            }
            const { data } = await api.post<Stream>('chat/completions', {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": query.prompt}],
                max_tokens: 2000,
                stream: true,
                }, {
                    responseType: 'stream'
                })
            data.pipe(res)
            // console.log(res)
            // res.end(JSON.stringify(data))
            break;
        default:
            res.end('')
    }
}).listen(9001)

console.log('http://localhost:9001')