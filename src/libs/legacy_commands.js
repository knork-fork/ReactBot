// Globals
senderUsername = "";
senderAvatar = "";
messageContent = "";

async function sendWebhook(message, webhook)
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

async function webhookLog(msg, client, webhookId, webhookToken)
{
    if (webhookId == "" || webhookToken == "")
        return;

    var webhook = await client.fetchWebhook(webhookId, webhookToken);

    if (webhook == null)
    {
        // No webhook found, die
        console.log("No log webhook found");
        return;
    }

    await webhook.send(msg, {
        username: "ReaccBot Logger"
    });
}

class Commands
{
    constructor(client, config)
    {
        this.client = client;
        this.config = config;
    }

    hooklog(msg)
    {
        webhookLog(msg, this.client, this.config.logWebhookId, this.config.logWebhookToken);
    }

    handleMessageCommands()
    {
        this.client.on("message", async message => 
        {
            // Ignore other bots
            if (message.author.bot) return;

            // Ignore any message that does not start with set prefix
            if (message.content.indexOf(this.config.prefix) !== 0) return;

            // Respond only to author
            if (this.config.authorOnly == "true")
            {
                if (message.author.id != this.config.authorid) return;
            }

            // Ignore dev channel
            if (message.channel.id == this.config.devChannel)
            {
                this.hooklog("Ignored dev channel");
                return;
            }

            // Split command and arguments
            const args = message.content.slice(this.config.prefix.length).trim().split(/ +/g);
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

                this.hooklog("Someone used help command in " + message.guild.name + "::" + message.channel.name);
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
                    this.hooklog("Emoji not found: " + emote + " in " + message.guild.name + "::" + message.channel.name);
                }
                else
                {	
        			// Get user data
        			senderUsername = message.author.username;
        			senderAvatar = message.author.avatarURL;

        			// Get any webhook from channel owned by this bot itself
                    var webhooks = await message.channel.fetchWebhooks();
                    var webhook = null;
                    var bot_id = this.client.user.id;
                    webhooks.some(function (web) {
                        if (web.owner != null && web.owner.id == bot_id) {
                            webhook = web;
                            return true; // "true" breaks loop
                        }
                    });

        			if (webhook == null)
        			{
        				// No webhook found, create one and then send to it
                        this.hooklog("Webhook created in " + message.guild.name + "::" + message.channel.name);
        				message.channel.createWebhook("ReaccBot Webhook", this.client.user.avatarURL).then(
        					function(webhook) {
        						sendWebhook(message, webhook);
        					}
        				);	
        			}
        			else
        			{
        				// Send to found webhook
        				sendWebhook(message, webhook);
                        this.hooklog("Someone used emote command in " + message.guild.name + "::" + message.channel.name);
        			}
                }

                // Delete original message
                message.delete();
            }

            // Broadcast message to channel
            if (command === "broadcast")
            {
                if (message.author.id != this.config.authorid)
                {
                    this.hooklog(
                        message.author.username + " was naughty and tried using broadcast in " 
                        + message.guild.name + "::" + message.channel.name
                    );
                }

                var channelId = args[0];
                var argsArr = args;
                argsArr.shift();
                var msg = argsArr.join(" ");

                var channel = await this.client.channels.get(channelId);
                if (channel == null)
                {
                    message.channel.send("Channel not found!");
                }
                channel.send(msg);

                this.hooklog(
                    "Broadcasted from " + message.guild.name + "::" + message.channel.name
                    + " to " + channel.guild.name + "::" + channel.name
                );
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

                this.hooklog("Old emote command used in " + message.guild.name + "::" + message.channel.name);
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

                this.hooklog("Someone used list command in " + message.guild.name + "::" + message.channel.name);
            }

            // Ping tool
            if (command === "ping") 
            {
                // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
                // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
                const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(this.client.ping)}ms`);
            }

            if (command === "hong") 
            {
                message.channel.send("Kong!");
            }
        });
    }
}

module.exports = Commands;
