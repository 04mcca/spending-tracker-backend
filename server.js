require('dotenv').config()

const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')

const app = express()

// Configure CORS: allow the frontend origin set in `FRONTEND_URL` or `VERCEL_URL`, otherwise allow all
const frontendOrigin = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
if (frontendOrigin) {
    app.use(cors({ origin: frontendOrigin }))
    console.log('CORS configured for', frontendOrigin)
} else {
    app.use(cors())
    console.log('CORS: allowing all origins (unset FRONTEND_URL to restrict)')
}
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ensure .env exists — if missing, copy from .env.example to help the developer
const envPath = path.join(__dirname, '.env')
const envExamplePath = path.join(__dirname, '.env.example')
if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath)
        console.warn('.env not found — copied .env.example to .env. Please open .env and fill your Supabase values.')
        // reload dotenv so values are available if user immediately edited (we still exit below)
        require('dotenv').config()
    } else {
        console.warn('.env not found and .env.example not present. Create a .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
    }
}

// Debugging logs for environment
console.log('Checking environment variables:')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'Missing')

let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
} else {
    console.error('Required Supabase environment variables are missing. Server will not start until .env is configured.')
    // Exit with non-zero so the developer notices; nodemon will allow restart after fix
    process.exit(1)
}

app.get('/', (req, res) => {
    res.send('Backend running')
})

// Insert expense
app.post('/api/expenses', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured. Copy .env.example to .env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' })
    try {
        const { amount, shop, category, paymentMethod } = req.body || {}

        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid or missing `amount` (number).' })
        }

        const row = {
            amount,
            shop: shop || null,
            category: category || null,
            payment_method: paymentMethod || 'Apple Pay'
        }

        const { data, error } = await supabase.from('expenses').insert([row]).select()

        if (error) {
            console.error('Supabase insert error', error)
            return res.status(500).json({ error: error.message || error })
        }

        return res.status(201).json({ success: true, expense: data && data[0] })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message || 'Server error' })
    }
})

// List expenses, newest first
app.get('/api/expenses', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured. Copy .env.example to .env and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' })
    try {
        const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase select error', error)
            return res.status(500).json({ error: error.message || error })
        }

        return res.json(data)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: err.message || 'Server error' })
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log('Supabase URL loaded')
    console.log('Service key loaded')
})
