const { Configuration, OpenAIApi } = require("openai") ;
const {Client, Events, GatewayIntentBits, REST, Routes } = require('discord.js');

const { token, CLIENT_ID, OPENAI_API_KEY } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});



async function aiResponse(prompt) {

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.9,
    });
    return completion.data.choices[0].text;
    
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } 
  }
}


async function setCommands(){
	const commands = [
	
		{
		  name: 'question',
		  description: 'Ask the AI any question',
		  options: [{name: "prompt", description: "enter your question", type: 3, required: true}],
		}
	  ];
	 
	  
	try {
		console.log('Started refreshing application (/) commands.');
	
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
	
		console.log('Successfully reloaded application (/) commands.');
	  } catch (error) {
		console.error(error);
	  }
  }

  setCommands();


  client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	
	if (interaction.commandName === 'question') {
		const prompt = interaction.options.getString('prompt');
		const response = aiResponse(prompt);
		
		response.then(async function(result){
			
			await interaction.reply(result);
		})
	  
	} 
  });



client.login(token);
