# ReactBot
Discord bot that sends custom emojis to text channels. 

## Commands

Get a list of commands
```ini
!help
```

Send a custom emoji
```ini
!emote <emoji_name>

;e.g. !emote pepethink
```

React to a message with custom emoji
```ini
[ NOT IMPLEMENTED YET! ]
[ Developer mode needs to be ON! ]

!reacc <emoji_name> <message_id>

;e.g. !reacc pepethink 528621767221182470
```

Get a list of all custom emojis
```ini
!list
```

Test latency
```ini
!ping
```

## Installation

Node.js 6.0.0 or newer is required.
You can check node version with:
```
node -v
```

Install Discord library:
```
npm install discord.js
```

Add bot token and author id to config.json.
You can setup your bot at: https://discordapp.com/developers

Run bot using:
```
node reaccbot.js
```
