console.log("Running bot...");

// Load discord.js library
const Discord = require("discord.js");

// Load client
const client = new Discord.Client();

// Load config file
const config = require("./config.json");

if (config.isReplit == "true")
{
	// https://docs.replit.com/repls/secrets-environment-variables
	config.token = process.env.discord_token;
	config.authorid = process.env.author_id;

	// Keep alive script for repl.it
	const keep_alive = require('./keep_alive.js');
}

// Globals
var senderUsername;
var senderAvatar;
var messageContent;

client.on("ready", () => 
{
    // Run when client starts and logs in
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 

    // Set activity (informative only)
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("message", async message => 
{ 
    // Ignore other bots
    if (message.author.bot) return;

    
    // Ignore any message that does not start with set prefix
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Respond only to author
    if (config.authorOnly == "true")
    {
        if (message.author.id != config.authorid) return;
    }
    
    // Split command and arguments
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // List available commands
    if (command === "help")
    {
        var text = "```ini\n";
        text += "[ Send custom emoji (with optional amount) ]\n"
        text += "!emote <emoji_name> <amount>\n";
		text += "e.g. !emote pepethink\n\n";
		
		text += "[ Send custom emoji (no webhook) ]\n"
        text += "!emote_old <emoji_name>\n";
        text += "e.g. !emote_old pepethink\n\n";

        text += "[ React to a message with custom emoji ]\n"
        text += "; NOT IMPLEMENTED YET! ;\n";
        text += "; Developer mode needs to be ON! ;\n"
        text += "!reacc <emoji_name> <message_id>\n";
        text += "e.g. !reacc pepethink 528621767221182470\n\n";

        text += "[ Get a list of all custom emojis ]\n"
        text += "!list\n\n";

        text += "[ Test latency ]\n"
        text += "!ping\n";
        text += "```";
        message.channel.send(text);
	}
	
	// Send an emoji
    if (command === "emote")
    {
        var emote = args[0];

        // Clean emote string
		if (emote.includes("<"))
		{
			emote = emote.replace("<", "");
			emote = emote.replace(":", ""); // Removes only the first occurence
			emote = emote.substr(0, emote.indexOf(':'));
		}
		if (emote.includes(":"))
		{
			emote = emote.replace(/:/g, "");
		}

        // Find custom emoji
        var emoji = message.guild.emojis.find(e => e.name == emote);
		
		// Get repeat number
		var num = args[1];
		if (!isNaN(num))
		{
			// Clamp between 1 and 5
			if (num < 1)
				num = 1;
			if (num > 5)
				num = 5;
		}
		else
			num = 1;

        // Construct content string
        if (emoji == null)
            messageContent = null;
        else
		{
			messageContent = "";
			for (var i = 0; i < num; i++)
			{
				if (emoji.animated)
					messageContent += "<a:" + emote + ":" + emoji.id + ">";
				else
					messageContent += "<:" + emote + ":" + emoji.id + ">";
			}
		}

        // Webhook
        if (messageContent == null)
        {
            message.channel.send("Emoji not found!");
        }
        else
        {	
			// Get user data
			senderUsername = message.author.username;
			senderAvatar = message.author.avatarURL;
			
			// Get any webhook from channel
            var webhooks = await message.channel.fetchWebhooks();
			var webhook = webhooks.first();
			
			if (webhook == null)
			{
				// No webhook found, create one and then send to it
				message.channel.createWebhook("ReaccBot Webhook", client.user.avatarURL).then(
					function(webhook) {
						sendWebhook(webhook);
					}
				);	
			}
			else
			{
				// Send to found webhook
				sendWebhook(webhook);
			}
        }
        
        // Delete original message
        message.delete();
    }

    // Send an emoji
    if (command === "emote_old")
    {
        var emote = args[0];

        // Find custom emoji
        var emoji = message.guild.emojis.find(e => e.name == emote);
        
        // Send custom emoji
        if (emoji == null)
            message.channel.send("Emoji not found!");
        else if (emoji.animated)
            message.channel.send("<a:" + emote + ":" + emoji.id + ">");
        else
            message.channel.send("<:" + emote + ":" + emoji.id + ">");

        // Delete original message
        message.delete();
    }

    // List all custom emojis in guild
    if (command === "list")
    {
        var text = "```ini\n[ List of custom emojis ]\n\n";
        var emojis = message.guild.emojis;
        
        emojis.forEach(function(emoji) {
            text += ":" + emoji.name + ":";

            if(emoji.animated)
                text += " [ animated ]";

            text += "\n";
        });
        
        text += "```";
        message.channel.send(text);
    }
    
    // Ping tool
    if (command === "ping") 
    {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if (command === "hong") 
    {
        message.channel.send("Kong!");
    }
});

client.login(config.token);

async function sendWebhook(webhook)
{
	if (webhook == null)
	{
		// No webhook found, die
		message.channel.send("No webhook found in this channel!");
		return;
	}	

	await webhook.send(messageContent, {
		username: senderUsername,
		avatarURL: senderAvatar,
	});
}
