import { MailListener } from "./services/mailListener";
import { config } from "dotenv";
import { MailSender } from "./services/mailSender";
import { MailParser } from "./services/mailParser";

import { GPIO } from "./services/gpioHandler";
import { HostHandler } from "./services/hostHandler";
import { StateManager } from "./services/stateManager";

config();

async function main() {
    const gpio = new GPIO();
    const mailService = new MailListener();
    const mailSender = new MailSender();
    const mailParser = new MailParser();
    const stateManager = new StateManager();
    const hostHandler = new HostHandler({
        ip: process.env.HOST_IP ?? "",
        powerButtonRelay: 1
    }, gpio)

    run(mailService, mailSender, mailParser, hostHandler, stateManager);
}

async function run(mailService: MailListener, mailSender: MailSender, mailParser: MailParser, hostHandler: HostHandler, stateManager: StateManager) {
    try {
        await mailService.connectToImap();
        console.log("Connected to IMAP");

        console.log("Getting emails...");
        const emails = await mailService.getNewEmails();
        console.log("Getting schedule...");
        const currentSchedule = stateManager.getSchedule();
        console.log("Current Schedule: ", currentSchedule);
        const currentTime = new Date();

        if (!emails.length) {
            console.log("No emails found")
            if (!currentSchedule || currentTime > currentSchedule.shutdownTime) {
                console.log("Shutdown time passed, attemtping to close the server...")
                await hostHandler.turnServerOff();
                console.log("Server closed.")
            }
            return;
        }

        let biggestRequestedHour = 0;
        let biggestRequestedHourUser = "";

        emails.forEach((email) => {
            const requestedHours = mailParser.extractHours(email.content);
            if (requestedHours > biggestRequestedHour) {
                biggestRequestedHour = requestedHours;
                biggestRequestedHourUser = email.from;
            }
        });

        const requestedShutDownDate = new Date();
        requestedShutDownDate.setHours(requestedShutDownDate.getHours() + biggestRequestedHour);

        console.log(`From ${emails.length} emails, the biggest request is of ${biggestRequestedHour}h.`)

        if (!(await hostHandler.isServerOnline()) || !currentSchedule || currentSchedule.shutdownTime < requestedShutDownDate) {
            console.log("The server is either offline, or scheduled to shutdown sooner than the request.")
            emails.forEach((email) => {
                if (biggestRequestedHour) {
                    mailSender.sendEmail('turn-on-confirmation', "Vizionare placuta bossu'", email.from, { shutdownTime: requestedShutDownDate.toLocaleTimeString('ro-RO') })
                }
            });
            await hostHandler.turnServerOn();
            stateManager.saveSchedule(biggestRequestedHourUser, currentTime, requestedShutDownDate);
        } else {
            console.log("The server is already online, and scheduled until later.")
            emails.forEach((email) => {
                if (biggestRequestedHour) {
                    mailSender.sendEmail('turned-on-information', "Vizionare placuta bossu'", email.from, { shutdownTime: requestedShutDownDate.toLocaleTimeString('ro-RO') })
                }
            });
        }
    } catch (error) {
        console.log(error);
    } finally {
        await mailService.disconnectFromImap();
        console.log("Disconnected from IMAP.")
        setTimeout(() => run(mailService, mailSender, mailParser, hostHandler, stateManager), 10000);
    }
}

main();