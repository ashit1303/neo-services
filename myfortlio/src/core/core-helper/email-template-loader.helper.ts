import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import * as utils from 'util';

const readFile = utils.promisify(fs.readFile);

async function loadTemplateHtml(fileName: string, data: Record<string, any>) {
  try {
    const filePath = path.resolve(__dirname, fileName);
    const ejsFile = await readFile(filePath, 'utf8');
    const rendered = ejs.render(ejsFile, data);
    return rendered;
  } catch (err) {
    console.error(err);
    return Promise.reject('Could not load html template');
  }
}

module.exports = { loadTemplateHtml };