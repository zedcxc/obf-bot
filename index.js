require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const AstrarAPI = require('./astrar')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

const api = new AstrarAPI(
  'https://obfuscate.astrarservices.de',
  process.env.ASTRAR_API_KEY
)

client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (!message.content.startsWith('.obf')) return

  const file = message.attachments.first()
  if (!file) {
    return message.reply('❌ Attach a `.lua` file.')
  }

  if (!file.name.endsWith('.lua')) {
    return message.reply('❌ Only `.lua` files are allowed.')
  }

  try {
    const res = await fetch(file.url)
    const luaCode = await res.text()

    if (!luaCode.trim()) {
      return message.reply('❌ Lua file is empty.')
    }

    const result = await api.obfuscate(luaCode)

    await message.reply({
      content: `✅ Obfuscated successfully (${result.duration}ms)`,
      files: [{
        attachment: Buffer.from(result.code),
        name: 'obfuscated.lua'
      }]
    })

  } catch (err) {
    message.reply(`❌ Error: ${err.message}`)
  }
})

client.login(process.env.DISCORD_TOKEN)
