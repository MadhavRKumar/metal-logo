const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

(async function myFunction() {
    const driver = await new Builder().forBrowser('firefox').build();
    const file = fs.createWriteStream('image_urls.txt');
    let urls = [];
    file.on('error', function(err) {
        console.error(err);
    })
    try {
        await driver.get('https://www.metal-archives.com/search/advanced/searching/bands?bandName=&genre=Brutal&country=&yearCreationFrom=&yearCreationTo=&bandNotes=&status=&themes=&location=&bandLabelName=#bands');
        const originalWindow = await driver.getWindowHandle();
        for (let x = 0; x < 10; x++) {
            
            await driver.wait(until.elementLocated(By.xpath("//table/tbody/tr")));
            const rows = await driver.findElements(By.xpath("//table/tbody/tr/td/a"));
            for (let i = 0; i < rows.length; i++) {
                await driver.executeScript("window.scrollBy(0, 26)");
                const curLink = rows[i];

                const a = driver.actions();
                await a.keyDown(Key.CONTROL).click(curLink).perform();

                await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 10000);

                const windows = await driver.getAllWindowHandles();
                windows.forEach(async handle => {
                    if (handle !== originalWindow) {
                        try {
                            await driver.switchTo().window(handle);
                        }
                        catch (e) {
                            return console.error(e);
                        }
                    }
                });

                await driver.wait(until.elementLocated(By.id("band_sidebar")));
                const logo = await driver.findElements(By.id("logo"));
                if (logo.length > 0) {
                    const href = await logo[0].getAttribute("href");
                    urls.push(href);
                }
                await driver.close();
                await driver.switchTo().window(originalWindow);
            }
            await driver.executeScript("window.scrollBy(0, -window.innerHeight)");
            const next = await driver.findElement(By.id("searchResultsBand_next"));

            await next.click();
        }


    } catch (e) {
        return console.error(e);
    }
    finally {
        urls.forEach((url) => {file.write(url+'\n')});
        file.end();
        driver.quit();
    }
})()