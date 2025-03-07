import { MailListener } from "./services/mailListener";
import { config } from "dotenv";
import { MailSender } from "./services/mailSender";
import { MailParser } from "./services/mailParser";

config();

async function main() {
    const mailService = new MailListener();
    const mailSender = new MailSender();
    const mailParser = new MailParser();
    run(mailService, mailSender, mailParser);
}

async function run(mailService: MailListener, mailSender: MailSender, mailParser: MailParser) {
    try {
        await mailService.connectToImap();
        console.log("Connected!")

        const emails = await mailService.getNewEmails();

        let biggestRequestedHour = 0;
        let sender = "";

        emails.forEach((email) => {
            const requestedHours = mailParser.extractHours(email.content);
            if (requestedHours > biggestRequestedHour) {
                biggestRequestedHour = requestedHours;
                sender = email.from;
            }
        });

        if (biggestRequestedHour) {
            const shutDownDate = new Date();
            shutDownDate.setHours(shutDownDate.getHours() + biggestRequestedHour);
            mailSender.sendEmail('turn-on-confirmation', "Vizionare placuta bossu'", sender, { shutdownTime: shutDownDate.toLocaleTimeString('ro-RO') })
        }

    } catch (error) {
        console.log(error);
    } finally {
        await mailService.disconnectFromImap();
        console.log("Disconnected!")
        setTimeout(() => run(mailService, mailSender, mailParser), 10000);
    }
}

main();