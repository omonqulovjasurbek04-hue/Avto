import { GoogleGenAI } from '@google/genai';

const apiKey = process.env['GEMINI_API_KEY'];

const ai = new GoogleGenAI({
    apiKey: apiKey || '',
});

const tools = [
    {
        type: 'code_execution',
    },
    {
        type: 'google_search',
    },
    {
        type: 'url_context',
    },
];

async function main() {
    const promptInput = process.argv[2] || '';

    const interaction = await ai.interactions.create({
        agent: 'antigravity-preview-05-2026',
        input: promptInput,
        background: true,
        tools: tools,
        environment: {
            type: 'remote',
            // @ts-ignore
            network: 'disabled',
        },
    });

    console.log(`Research started: ${interaction.id}`);

    while (true) {
        const result = await ai.interactions.get(interaction.id);
        if (result.status === 'completed') {
            if (result.output_text) {
                console.log(result.output_text);
            }
            break;
        } else if (result.status === 'failed') {
            console.log(`Research failed.`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

main().catch((err) => {
    console.error('Research error:', err);
    process.exit(1);
});
