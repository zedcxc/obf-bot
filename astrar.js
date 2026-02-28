class AstrarAPI {
  constructor(apiUrl, apiKey, timeout = 30000) {
    if (!apiUrl || !apiKey) throw new Error('apiUrl and apiKey required')
    this.apiUrl = apiUrl.replace(/\/$/, '')
    this.apiKey = apiKey
    this.timeout = timeout
  }

  async obfuscate(code, preset = 'LuaU') {
    if (!code || typeof code !== 'string') throw new Error('Code required')

    const start = Date.now()
    const response = await this._request('/api/obfuscate', 'POST', { code, preset })
    const duration = Date.now() - start

    if (!response.success) throw new Error(response.error || 'Obfuscation failed')
    return { code: response.code, duration }
  }

  async _request(endpoint, method = 'GET', body = null) {
    const url = `${this.apiUrl}${endpoint}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

module.exports = AstrarAPI
