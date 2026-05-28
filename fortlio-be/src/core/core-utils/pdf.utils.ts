import * as playwright from 'playwright';
import { AppError } from './err-util';
// const{sendFile}= require('./aws');

export async function generatePdf(html: string): Promise<Buffer<ArrayBufferLike>> {
  try {
    // let url;
    // const html = await ejs.render(templateHtml, data);
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf({ format: 'A4' });
    // url = await sendFile('obenev', `${id}${fileName?'- '+ fileName:'bill'}.pdf`, buffer, 'pdf');
    await browser.close();
    // return url.Location;
    return buffer;
  } catch (err: any) {
    throw new AppError('Failed to generate PDF', err.message);
  }
}
