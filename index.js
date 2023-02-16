const puppeteer = require("puppeteer");
const randomScript = require("./scripts.js");

async function autoClick() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.google.com/?hl=en", { waitUntil: "networkidle0" });

  await page.waitForSelector('input[name="q"]');
  await page.type('input[name="q"]', "business247");

  // Bấm Enter và đi
  await page.keyboard.press("Enter");
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  let isFound = false;
  let currentPage = 1;
  while (!isFound) {
    await autoScroll(page);
    await page.waitForTimeout(2000);

    // Kiểm tra trang search có website cần tìm chưa
    const searchResults = await page.$$eval(".g", (results) => {
      return results.map((result) => ({
        title: result.querySelector("h3")?.textContent?.trim(),
        link: result.querySelector("a")?.href?.trim(),
      }));
    });
    // console.log(searchResults);
    const websiteLink = searchResults.find((result) => result.link.includes("business247.top"))?.link;

    if (websiteLink) {
      console.log(`Found website: ${websiteLink}`);
      isFound = true;
      const linkHandle = await page.$(`a[href="${websiteLink}"]`);
      await linkHandle.click();
      await page.waitForNavigation({ waitUntil: "networkidle0" });
      await randomScript.runScript1(page);
    } else {
      // Nếu không tìm thấy link thì Nếch
      // const nextPageButton = await page.$("#pnnext");
      // if (nextPageButton) {
      //   await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), nextPageButton.click()]);
      // } else {
      //   console.log("Website not found in search results.");
      //   break;
      // }
      const nextButton = await page.$x(`//a[@aria-label="Page ${currentPage + 1}"]`);
      if (nextButton.length > 0) {
        await Promise.all([page.waitForNavigation({ waitUntil: "networkidle2" }), nextButton[0].click()]);
        currentPage++;
        // Scroll down the page to load more search results
        await scrollRandom(page, Math.floor(Math.random() * 100) + 10);
      } else {
        console.log("404 Not found!");
        break;
      }
    }
  }
  await browser.close();
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
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
  });
}
// Thêm param distance cho dễ custom
async function scrollRandom(page, par) {
  await page.evaluate(async (par) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, par);
        totalHeight += par;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, par);
}

autoClick();
