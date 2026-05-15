import * as playwright from 'playwright';
// const{sendFile}= require('./aws');

async function generateObenPdf(html: string) {
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
  } catch (err) {
    console.error(err);
  };
}
module.exports = {
  generateObenPdf,
};