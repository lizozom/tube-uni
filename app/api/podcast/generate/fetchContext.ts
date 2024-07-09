import wiki from 'wikipedia';
import { getContent } from './getContent';

const getWikiContent = async (topic: string) => {
    const page = await wiki.page(topic);
    if (page) {
        const content = await page.content();
        return content;
    }
}

export const fetchContext = async (topic: string) => {
    const relavantWikiTopicsPrompt = `
        Give me a list of AT MOST 3 relevant wikipedia page for the topic "${topic}". Return the response as a JSON list.
        The list should only contain the topics, for example: ["Topic A", "Topic B", "Topic C"].
        IMPORTANT! Return ONLY a JSON object. Don't add quotes or comments around it.
    `;

    const context: Array<string> = [];
    const processedPages: Array<string> = [];
    try {
        const relevantWikiTopicsStr = await getContent(relavantWikiTopicsPrompt);
        if (relevantWikiTopicsStr) {
            const relevantWikiTopics = JSON.parse(relevantWikiTopicsStr.replace('```json', '').replace('```', ''));

            console.log(relevantWikiTopics);
        
            for (const topic of relevantWikiTopics) {

                const page = await wiki.page(topic);
                if (page && processedPages.indexOf(page.title) === -1) {
                    processedPages.push(page.title);
                    const content = await page.content();
                    context.push(content);
                }
            }

        }
    } catch (e) {
        console.error(e.message);
    }

    console.log(`Context from pages: ${processedPages}`);

    return context;
}