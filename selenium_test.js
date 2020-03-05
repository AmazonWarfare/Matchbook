console.log('######################################################################################################################################################');
console.log('Beginning Selinium Testing');

const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

(async function test_selenium_functioning() {
    let test_state = 0;
    let error;

    let driver = await new Builder().forBrowser('firefox').withCapabilities(Capabilities.firefox()).build();

    try {
        await driver.get('http://www.google.com/ncr');
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.titleIs('webdriver - Google Search'), 1000);

        console.log('######################################################################################################################################################');
        console.log('test_selenium_functioning PASSED');
        console.log('######################################################################################################################################################');
    } catch (err) {
        test_state = 1;
        error = err;
    } finally {
        await driver.quit();

        if (test_state == 1) {
            console.log('######################################################################################################################################################');
            console.log('test_selenium_functioning FAILED');
            console.log('######################################################################################################################################################');
            throw error;
        }
    }
})();

let driver = new Builder().forBrowser('firefox').withCapabilities(Capabilities.firefox()).build();

driver.get('http://www.hjgkjkghjg.com').then(function(){
    driver.findElement(By.name('q')).sendKeys('BrowserStack\n').then(function(){
        driver.getTitle().then(function(title) {
            console.log(title);
            driver.quit().then(r => {});
        });
    });
}).catch(error => console.log(error.message));