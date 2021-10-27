import { dirname, join } from 'path';
import { URL } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(new URL(import.meta.url).pathname.slice(process.platform == 'win32' ? 1 : 0));

console.log(import.meta.url, __dirname);

dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(cors());
app.use(helmet());

// payload types:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.raw());

app.all('**', (req, res) => {
    const METHOD = chalk.ansi256(202)(req.method);
    const HOST = chalk.yellow(req.hostname);
    const REQUEST_URL = chalk.green(req.originalUrl);
    const PAYLOAD_TYPE = chalk.hex('#3193cd')(req.headers['content-type']?.split(';')[0]);
    
    let logMessage = `${METHOD} to ${REQUEST_URL} from ${HOST}`;
    
    if (['POST', 'PATCH'].includes(req.method) || (req.body && Object.keys(req.body).length)) {
        logMessage += ` with payload of type ${PAYLOAD_TYPE}`;
    }
    
    console.log(logMessage); // stick a breakpoint here or below to inspect `req.body` or in the `inspectAsync` method below
    
    inspectAsync(req);
    
    res.sendStatus(204);
});

app.listen(process.env.PORT, () => {
    console.log(`request inspector running on port ${chalk.green(process.env.PORT)}`);
});

async function inspectAsync(...args: any[]) {
    // the below ensures that the log happens asynchronously
    await Promise.resolve();
    console.log('inspecting async');
    console.table(args);
}
