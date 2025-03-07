import nodemailer from 'nodemailer'
import { renderFile } from 'ejs';


class MailSender {
    getTransport() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(templateName: string, subject: string, destination: string, data: any) {
        const content = await new Promise<string>((resolve, reject) => {
            renderFile(`./templates/${templateName}.ejs`, data, function (err, str) {
                if (err) reject(err);
                resolve(str);
            });
        })

        const transporter = this.getTransport();
        const info = await transporter.sendMail({
            from: '"Serverul lui Bodi 🎥 bodi.movies.server@gmail.com"', // sender address
            to: destination, // list of receivers
            subject: subject, // Subject line
            html: content
        });
        transporter.close();
        console.log(info);
    }
}

export { MailSender }