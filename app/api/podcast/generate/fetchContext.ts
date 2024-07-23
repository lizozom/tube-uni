import wiki from 'wikipedia';
import { getContentYaml, parseContent } from '../../helpers';
import { contextPrompt } from '../../prompts';

export const fetchContext = async (topic: string, retry: boolean = false): Promise<Array<string>> => {
    const relavantWikiTopicsPrompt = contextPrompt(topic);
    const context: Array<string> = [];
    const processedPages: Array<string> = [];
    const relevantWikiTopics = await getContentYaml(relavantWikiTopicsPrompt) as Array<string>;

    for (const topic of relevantWikiTopics) {
        try {
            const page = await wiki.page(topic);
            if (page && processedPages.indexOf(page.title) === -1) {
                processedPages.push(page.title);
                const content = await page.content();
                context.push(content);
            }
        } catch (e) {
            console.warn(`Failed to fetch context for ${topic}`);
        }
    }


    console.log(`Context from pages: ${processedPages}`);

    return context;
}