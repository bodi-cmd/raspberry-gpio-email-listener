import { MailService } from "./services/mailListener";
import { sendEmail } from "./services/mailSender";
import { config } from "dotenv";

config();

async function main() {
    const mailService = new MailService();
    run(mailService);
}

async function run(mailService: MailService) {
    try {
        await mailService.connectToImap();
        console.log("Connected!")

        const emails = await mailService.getNewEmails();
        console.log(emails);

        emails.forEach(async (email) => {
            await sendEmail(email.from);
        })

    } catch (error) {
        console.log(error);
    } finally {
        await mailService.disconnectFromImap();
        console.log("Disconnected!")
        setTimeout(() => run(mailService), 10000);
    }
}

main();