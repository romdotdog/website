const path = require('path')
const axios = require('axios').default;
const { fastify } = require('fastify')
const { Octokit } = require('@octokit/core')
const fs = require('fs')
const localtunnel = require('localtunnel')
const closeWithGrace = require('close-with-grace')
// Plugins
const fastifyCookie = require('fastify-cookie');
const fastifySession = require('fastify-session');
const fastifyServerSesion = require('fastify-server-session')

// Import .env
require('dotenv').config()

// Create server
const app = fastify()

// Set cookie handler
app.register(fastifyCookie, {
    secret: process.env.cookieSecret,
    parseOptions: {}
});

// Get secrets
const clientId = process.env.id;
const clientSecret = process.env.secret;

console.log(clientId)

console.log(clientSecret)

app.listen(3000, async (err, address) => {

    try {
        const tunnel = await localtunnel({ port: 3000, subdomain: 'aspkg'})
        console.log('Listening on: ', tunnel.url)
        closeWithGrace({ delay: 1000 }, async function () {
            console.log('Closing...')
            tunnel.close()
            console.log('Done.')
        })
        app.addHook('onClose', () => {
            tunnel.close()
        })
    } catch {
        console.log('Listening on: ', address)
    }

})
// Static file serve
app.register(require('fastify-static'), {
    root: path.join(__dirname, '../aspkg-bss/assets/'),
    prefix: '/assets/'
})

app.get('/', async (req, res) => {
    if (req.query.code && req.query.token == null) {
        const body = {
            client_id: clientId,
            client_secret: clientSecret,
            code: req.query.code
        };

        const opts = {
            headers: {
                accept: 'application/json'
            }
        };

        const token = (await axios.post(`https://github.com/login/oauth/access_token`, body, opts)).data.access_token

        console.log('Token: ', token)

        res.setCookie('token', token)
    }
    res.type('html')
    res.send(fs.readFileSync('../aspkg-bss/index.html'))
})

app.get('/package', async (req, res) => {
    res.type('html')
    res.send(fs.readFileSync('../aspkg-bss/package.html'))
})

app.get('/404', async (req, res) => {
    res.type('html')
    res.send(fs.readFileSync('../aspkg-bss/404.html'))
})

app.get('/index.js', async (req, res) => {
    res.type('application/javascript')
    res.send(fs.readFileSync('../aspkg-bss/index.js'))
})

app.get('/index.css', async (req, res) => {
    res.type('css')
    res.send(fs.readFileSync('../aspkg-bss/index.css'))
})

// Package Searching
app.get('/search', (req, res) => {
    const query = req.query['query']
    if (!query) {
        // Send an empty list of results
        res.send(JSON.stringify({}))
        return
    }
})

app.get('/login', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`);
});

app.get('/api-logout', (req, res) => {
    // Erasing token logs the user out.
    res.clearCookie('token')
    res.send('Logged out.')
})