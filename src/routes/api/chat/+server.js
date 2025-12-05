import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import Groq from 'groq-sdk';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { messages } = await request.json();

		if (!messages || !Array.isArray(messages)) {
			return json({ error: 'Messages array is required' }, { status: 400 });
		}

		// System prompt pro chatbot, který pomáhá studentům s učebnicemi
		const systemMessage = {
			role: 'system',
			content: `Jsi užitečný AI asistent pro studenty, který pomáhá s učením a porozuměním učebnicím a pracovním sešitům. 
			Odpovídej stručně, přehledně a zaměřuj se na klíčové informace. 
			Pomáhej studentům pochopit složité koncepty jednoduchým způsobem.
			Odpovídej v češtině, pokud student píše česky.`
		};

		// Přidej system message na začátek konverzace
		const conversationMessages = [systemMessage, ...messages];

		let assistantMessage = null;

		// Zkus nejdřív Groq (FREE tier) - pokud je nastavený API klíč
		if (env.GROQ_API_KEY) {
			try {
				const groq = new Groq({
					apiKey: env.GROQ_API_KEY
				});

				const completion = await groq.chat.completions.create({
					model: 'llama-3.1-70b-versatile', // Rychlý a kvalitní model na Groq
					messages: conversationMessages,
					temperature: 0.7,
					max_tokens: 2000
				});

				assistantMessage = completion.choices[0]?.message?.content;
			} catch (groqError) {
				console.warn('Groq API error, trying OpenAI:', groqError.message);
				// Pokud Groq selže, zkus OpenAI
			}
		}

		// Pokud Groq není dostupný nebo selhal, zkus OpenAI
		if (!assistantMessage && env.OPENAI_API_KEY) {
			try {
				const openai = new OpenAI({
					apiKey: env.OPENAI_API_KEY
				});

				const completion = await openai.chat.completions.create({
					model: 'gpt-4o-mini', // Levnější model pro chat
					messages: conversationMessages,
					temperature: 0.7,
					max_tokens: 1000
				});

				assistantMessage = completion.choices[0]?.message?.content;
			} catch (openaiError) {
				console.error('OpenAI API error:', openaiError);
				throw openaiError;
			}
		}

		// Pokud ani jeden provider není dostupný
		if (!assistantMessage) {
			return json(
				{
					error: 'Žádný AI provider není nakonfigurován. Nastavte prosím GROQ_API_KEY (doporučeno - FREE) nebo OPENAI_API_KEY v .env souboru.\n\n💡 Groq API klíč získáte zdarma na: https://console.groq.com/keys'
				},
				{ status: 500 }
			);
		}

		return json({
			message: assistantMessage,
			role: 'assistant'
		});
	} catch (error) {
		console.error('Chat API error:', error);
		
		// Zpracuj specifické OpenAI chyby
		let errorMessage = error.message || 'An error occurred while processing your request';
		let statusCode = 500;
		
		if (error.status === 429) {
			errorMessage = 'Překročen limit OpenAI API. Zkontrolujte prosím svůj billing a quota na https://platform.openai.com/account/billing';
			statusCode = 429;
		} else if (error.status === 401) {
			errorMessage = 'Neplatný OpenAI API klíč. Zkontrolujte prosím konfiguraci.';
			statusCode = 401;
		} else if (error.status === 403) {
			errorMessage = 'Přístup k OpenAI API byl zamítnut. Zkontrolujte prosím svůj API klíč a oprávnění.';
			statusCode = 403;
		} else if (error.message?.includes('quota')) {
			errorMessage = 'Překročen limit OpenAI API. Zkontrolujte prosím svůj billing a quota na https://platform.openai.com/account/billing';
			statusCode = 429;
		}
		
		return json(
			{
				error: errorMessage,
				statusCode: error.status || statusCode
			},
			{ status: statusCode }
		);
	}
}


