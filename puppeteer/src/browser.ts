import { user_viewed } from './metrics';
import axios from 'axios';
import { Command } from 'commander';
import * as common from 'common';
import express from 'express';
import puppeteer, { Browser } from 'puppeteer-core';

const test_id = process.env.HOSTNAME;

const logger = common.getLogger();
const promClient = new common.PromClient(`omegle`);
common.listenGlobalExceptions(async () => {
  logger.debug(`clean up browser`);
  await promClient.stop();
});

const port = 80;
const app = express();
app.get(`/health`, (req, res) => {
  logger.debug(`got health check`);
  res.send(`Health is good.`);
});

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const program = new Command();

program
  .option(`--webcam-file <file>`, `Path to the webcam file`, false)
  .parse(process.argv);

const options = program.opts();
const webcamFile = options.webcamFile;

logger.info(`Webcam file: ${webcamFile}`);

if (process.env.METRICS) {
  logger.info(`PUSHING METRICS TO PROMETHEUS ENABLED`);
  promClient.startPush();
}

(async () => {
  const useFakeWebcam = true;
  const useProxy = true;
  let useAuth = true;
  const headless = false;
  const screenshotPath = process.env.SCREENSHOT_PATH;

  if (screenshotPath) {
    logger.info(`screenshotPath: ${screenshotPath}`);
  }

  let url = `https://www.omegle.com/`;

  //data center
  let proxy = ``;
  let proxyUser = ``;
  let proxyPassword = ``;

  // residential;
  proxy = `http://localhost:8080`;
  useAuth = false;

  const args = [`--use-fake-ui-for-media-stream`];
  if (useFakeWebcam) {
    args.push(...[`--use-fake-device-for-media-stream`, `--no-sandbox`]);
    if (webcamFile) {
      args.push(`-use-file-for-fake-video-capture=${webcamFile}`);
    }
  }

  if (useProxy) {
    logger.info(`USING PROXY`);
    args.push(`--proxy-server=${proxy}`);

    args.push(`--proxy-bypass-list=*.*.*.*;*google*;*stun1*;*start*;*events*`); //*icecandidate*;
  }

  const ipResponse = await axios.get(`http://ip-api.com/json`);
  let myIP = `199.36.223.2091`;
  myIP = ipResponse.data.query;

  const proxyConfig = {
    host: `localhost`,
    port: 8080,
  };

  let proxyIp: string;

  try {
    proxyIp = (
      await axios.get(`http://ip-api.com/json`, {
        proxy: proxyConfig,
      })
    ).data.query;
  } catch {
    proxyIp = myIP;
  }

  logger.info(`myIP is ${myIP}`);
  logger.info(`proxyIp is ${proxyIp}`);

  let browser: Browser;
  if (process.env.DOCKER) {
    logger.info(`creating docker browser: ` + process.env.DOCKER);
    browser = await puppeteer.launch({
      headless: true,
      args: [`--no-sandbox`, `--disable-gpu`, ...args],
      executablePath: `${process.env.PUPPETEER_EXECUTABLE_PATH}`,
    });
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } else {
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: headless,
      args: args,
      defaultViewport: null,
      devtools: false,
      executablePath: `/usr/bin/google-chrome`,
    });
  }

  const [page] = await browser.pages();

  await page.setRequestInterception(true);

  page.on(`request`, (request) => {
    // Block All Images
    if (request.url().includes(`upload`)) {
      request.abort();
    } else if (request.url().includes(`icecandidate`)) {
      request.abort();
      return;
    } else {
      request.continue();
    }
  });

  if (useProxy && useAuth) {
    page.authenticate({ username: proxyUser, password: proxyPassword });
  }

  await page.setJavaScriptEnabled(true);

  page.on(`framenavigated`, async (frame) => {
    const url = frame.url(); // the new url

    logger.debug(`changed url: ${url}`);
    if (url.includes(`ban`)) {
      console.error(`BANNED`);
      common.killSigint();
    }

    // do something here...
  });

  await page.goto(url);

  await page.exposeFunction(`onCustomEvent`, async (event: any) => {
    logger.debug(`Event: ${event}`);
    if (event.includes(`loadedmetadata`)) {
      logger.info(`user_viewed`);
      user_viewed.inc();
      if (screenshotPath) {
        const screenshotFile = `${screenshotPath}/screenshot-${new Date()}-${test_id}}.png`;
        logger.debug(`screenshot: ${screenshotFile}`);
        await page.screenshot({
          path: screenshotFile,
        });
      }
    }
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(url, [`camera`, `microphone`]);

  await delay(2000);

  // Wait and click on first result
  const searchResultSelector = `#chattypevideocell`;
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  await delay(2000);

  // Select all checkboxes
  const checkboxes = await page.$$(`input[type="checkbox"]`);

  logger.debug(`checkboxes.length: ${checkboxes.length}`);

  // Click on each checkbox
  for (const checkbox of checkboxes) {
    logger.debug(`checkbox: ${checkbox}`);
    try {
      await checkbox.click();
    } catch (e) {
      console.error(`checkbox: ${e}`);
    }
  }

  await delay(1000);

  await page.click(`input[value="Confirm & continue"]`);

  await page.waitForSelector(`#othervideo`);

  await page.evaluate(() => {
    // Override the RTCPeerConnection class in the window object
    window.RTCPeerConnection = class extends RTCPeerConnection {
      constructor(configuration: RTCConfiguration | undefined) {
        super(configuration);

        // Add event listener for connection state change
        this.addEventListener(`connectionstatechange`, () => {
          const myWindow: any = window;
          myWindow.onCustomEvent(this.connectionState);
        });
      }
    };

    const video: any = document.getElementById(`othervideo`);
    let previousSource = video.src;

    //  TODO: check if this works
    video.addEventListener(`loadedmetadata`, () => {
      const myWindow: any = window;
      myWindow.onCustomEvent(`loadedmetadata`);

      if (video.src !== previousSource) {
        logger.info(`Video source has changed.`);
        myWindow.onCustomEvent(`Video source has changed.`);
        // Perform additional actions as needed
      }
    });
    const myWindow: any = window;
    myWindow.onCustomEvent(`evalulate`);
  });

  delay(1000 * 60 * 20).then(() => {
    logger.info(`timeout reached`);
    common.killSigint();
  });

  while (true) {
    if (screenshotPath) {
      const screenshotFile = `${screenshotPath}/${test_id}-screenshot.png`;
      logger.debug(`screenshot: ${screenshotFile}`);
      await page.screenshot({
        path: screenshotFile,
      });
    }

    await delay(1000 * 5 + 1000 * 10 * Math.random());
  }

  // await delay(1000 * 60 * 5);

  // await browser.close();
  // logger.info("closed...");
})();
