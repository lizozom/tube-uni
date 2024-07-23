import YAML from 'yaml'

export const parseContent = (text: string) => {
    return YAML.parse(text.replace('```yaml', '').replace('```', '').replace("---", ""));
}