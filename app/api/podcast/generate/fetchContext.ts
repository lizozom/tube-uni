import wiki from 'wikipedia';
import { getContentJson } from './getContent';

export const fetchContext = async (topic: string, retry: boolean = false) => {
    const relavantWikiTopicsPrompt = `
        Give me a list of AT MOST 3 relevant wikipedia page for the topic "${topic}". 
        Return the response as a JSON list.
        The response should look like this:
        ["Topic A", "Topic B", "Topic C"].
    `;

    const context: Array<string> = [];
    const processedPages: Array<string> = [];

    const relevantWikiTopics = await getContentJson<Array<string>>(relavantWikiTopicsPrompt);
    console.log(relevantWikiTopics);
    
    for (const topic of relevantWikiTopics) {
        try {
            const page = await wiki.page(topic);
            if (page && processedPages.indexOf(page.title) === -1) {
                processedPages.push(page.title);
                const content = await page.content();
                context.push(content);
            }
        } catch (e: any) {
            console.warn(e.message);
        }
    }

    console.log(`Context from pages: ${processedPages}`);

    return context;
}