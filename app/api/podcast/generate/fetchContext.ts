import wiki from 'wikipedia';
import { YAMLParseError } from 'yaml';
import { getContent } from '../../helpers/getContent';
import { parseContent } from '../../helpers/parseContent';

const getWikiContent = async (topic: string) => {
    const page = await wiki.page(topic);
    if (page) {
        const content = await page.content();
        return content;
    }
}

export const fetchContext = async (topic: string, retry: boolean = false): Promise<Array<string>> => {
    const relavantWikiTopicsPrompt = `
        Give me a list of AT MOST 3 relevant wikipedia page for the topic "${topic}". Return the response as a YAML list.
        The list should only contain the topics, for example: ["Topic A", "Topic B", "Topic C"].
        IMPORTANT! Return ONLY a YAML object. Don't add quotes or comments around it.
    `;

    const context: Array<string> = [];
    const processedPages: Array<string> = [];
    try {
        const relevantWikiTopicsStr = await getContent(relavantWikiTopicsPrompt);
        if (relevantWikiTopicsStr) {
            const relevantWikiTopics = parseContent(relevantWikiTopicsStr) as Array<string>;
        
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
    } catch (e: any) {
        if (!retry && e instanceof YAMLParseError) {
            console.warn("Failed to parse YAML, retrying generation");
            return fetchContext(topic, true);
        } else {
            console.warn(e.message);
        }
    }

    console.log(`Context from pages: ${processedPages}`);

    return context;
}