// Simple XML value extractor for AWS API responses
// Handles common patterns in AWS XML responses without a full parser

export let extractXmlValue = (xml: string, tag: string): string | undefined => {
  let regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
  let match = xml.match(regex);
  return match?.[1]?.trim();
};

export let extractXmlValues = (xml: string, tag: string): string[] => {
  let regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'gs');
  let matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      matches.push(match[1].trim());
    }
  }
  return matches;
};

export let extractXmlBlock = (xml: string, tag: string): string | undefined => {
  let regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's');
  let match = xml.match(regex);
  return match?.[1]?.trim();
};

export let extractXmlBlocks = (xml: string, tag: string): string[] => {
  let regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gs');
  let blocks: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      blocks.push(match[1].trim());
    }
  }
  return blocks;
};

export let parseXmlToSimpleObject = (xml: string): Record<string, any> => {
  let result: Record<string, any> = {};
  let tagRegex = /<(\w+)(?:\s[^>]*)?>([^<]*(?:<(?!\/\1>)[^<]*)*)<\/\1>/g;
  let match;

  while ((match = tagRegex.exec(xml)) !== null) {
    let key = match[1]!;
    let value = match[2]!.trim();

    // Check if value contains nested XML
    if (value.includes('<') && value.includes('>')) {
      let existing = result[key];
      if (existing !== undefined) {
        if (!Array.isArray(existing)) {
          result[key] = [existing];
        }
        (result[key] as any[]).push(parseXmlToSimpleObject(value));
      } else {
        result[key] = parseXmlToSimpleObject(value);
      }
    } else {
      let existing = result[key];
      if (existing !== undefined) {
        if (!Array.isArray(existing)) {
          result[key] = [existing];
        }
        (result[key] as any[]).push(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};
