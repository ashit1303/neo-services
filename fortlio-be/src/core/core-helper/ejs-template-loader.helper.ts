import * as fs from 'fs';
import * as path from 'path';
import ejs from 'ejs';
import * as utils from 'util';

const readFile = utils.promisify(fs.readFile);

export async function loadTemplateHtml(fileName: string, data: Record<string, any>) {
  try {
    // const filePath = path.resolve(__dirname, fileName);
    const basePath = (process.env.BUN_ENV === 'prod') ? path.resolve(process.cwd(), 'dist/templates') : path.resolve(process.cwd(), 'src/ejs-templates');
    const filePath = path.join(basePath, fileName);
    const ejsFile = await readFile(filePath, 'utf8');
    const rendered = ejs.render(ejsFile, data);
    return rendered;
  } catch (err) {
    console.error(err);
    return Promise.reject('Could not load html template');
  }
}

