const puppeteer = require("puppeteer");

async function runScript1(page) {
  for (let i = 0; i < 5; i++) {
    // Lấy danh sách bài viết
    const articleLinks = await page.$$eval(".entry-title a", (links) => links.map((link) => link.href));

    // Chọn bài viết random
    const randomIndex = Math.floor(Math.random() * articleLinks.length);
    const randomArticleLink = await page.$$(".entry-title a");
    const randomArticle = randomArticleLink[randomIndex];
    await randomArticle.click();

    // Đợi tí
    await page.waitForSelector(".entry-content");

    // Úp and down
    const scrollAmount = 300;
    const scrollDirection = [-1, 1];
    for (let j = 0; j < 10; j++) {
      await page.evaluate(
        (scrollAmount, scrollDirection) => {
          window.scrollBy(0, scrollAmount * scrollDirection[Math.floor(Math.random() * scrollDirection.length)]);
          const textElements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
          const randomIndex = Math.floor(Math.random() * textElements.length);
          const randomTextElement = textElements[randomIndex];
          const mouse = new MouseEvent("dblclick", { bubbles: true });
          randomTextElement.dispatchEvent(mouse);
        },
        scrollAmount,
        scrollDirection
      );
      await page.waitForTimeout(1000);
      //   await scrollAndDoubleClick(page, scrollAmount * scrollDirection[Math.floor(Math.random() * scrollDirection.length)]);
    }

    // Trở về trang chủ
    await page.goBack();
    // const homeButton = await page.$(`a[href="http://www.business247.top/"]`);
    // await homeButton.click();
  }
}

async function scrollAndDoubleClick(page, distance) {
  await page.evaluate(async (distance) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, distance);

  const paragraphs = await page.$$eval("p", (paragraphs) => paragraphs.map((paragraph) => paragraph.textContent));
  const randomIndex = Math.floor(Math.random() * paragraphs.length);
  const randomParagraph = paragraphs[randomIndex];
  const words = randomParagraph.split(" ");

  const randomWordIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomWordIndex];

  const element = await page.$x(`//*[contains(text(), "${randomWord}")]`);
  if (element.length > 0) {
    await element[0].hover();
    await page.waitForTimeout(500);
    await element[0].dblclick();
    await page.waitForTimeout(500);
  }
}

module.exports = {
  runScript1,
};
