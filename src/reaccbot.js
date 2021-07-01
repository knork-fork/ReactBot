console.log("Running bot...");

// Load libraries
const Discord = require("discord.js");
const Legacy = require("./libs/legacy_commands.js");

// Load client
const client = new Discord.Client();

// Load config file
const config = require("./config.json");

if (config.isReplit == "true")
{
	// https://docs.replit.com/repls/secrets-environment-variables
	config.token = process.env.discord_token;
	config.authorid = process.env.author_id;
    config.devChannel = process.env.dev_channel;

	// Keep alive script for repl.it
	const keep_alive = require('./keep_alive.js');
}

client.on("ready", () => 
{
    // Run when client starts and logs in
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 

    // Set activity (informative only)
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

legacyCommands = new Legacy(client, config);
legacyCommands.handleMessageCommands();

client.login(config.token);
