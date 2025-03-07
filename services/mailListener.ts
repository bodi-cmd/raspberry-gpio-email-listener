import Imap from 'imap'

type ReceivedEmail = {
    from: string;
    subject: string;
    date: string;
    content: string;
}

const streamToString = (stream: NodeJS.ReadableStream) => {
    const chunks: any = [];
    return new Promise<string>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

const findTextPart = (struct: any): string => {
    for (var i = 0, len = struct.length, r; i < len; ++i) {
        if (Array.isArray(struct[i])) {
            if (r = findTextPart(struct[i]))
                return r;
        } else if (struct[i].type === 'text'
            && (struct[i].subtype === 'plain'))
            return struct[i].partID as string;
    }
    return '';
}

class MailListener {

    private readonly imap: Imap;

    constructor() {
        this.imap = new Imap({
            user: process.env.IMAP_EMAIL ?? "",
            password: process.env.IMAP_PASS ?? "",
            host: process.env.IMAP_HOST,
            port: 993,
            tls: true,
            tlsOptions: {
                rejectUnauthorized: false
            }
        });
    }

    async openInbox() {
        return new Promise((resolve, reject) => {
            this.imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                    reject(err);
                }
                resolve(box);
            });
        })
    }

    async connectToImap() {
        this.imap.removeAllListeners('error');
        this.imap.removeAllListeners('ready');
        this.imap.connect();
        return new Promise<void>((resolve, reject) => {
            this.imap.once('error', reject);
            this.imap.once('ready', () => {
                this.imap.removeListener('error', reject);
                resolve();
            });
        })
    }

    async disconnectFromImap() {
        this.imap.end();
        return new Promise((resolve) => {
            this.imap.once('end', resolve);
        })
    }

    async getNewEmails(): Promise<ReceivedEmail[]> {
        const result: ReceivedEmail[] = [];
        await this.openInbox();
        console.log("Opened inbox...");

        const unreadMails = await new Promise<number[]>((resolve, reject) => {
            this.imap.search(['UNSEEN'], function (err, results) {
                if (err) {
                    reject(err);
                }
                resolve(results);
            })
        });

        console.log(`Found ${unreadMails.length} unread mails.`);

        await Promise.all(unreadMails.map(async (uid) =>
            new Promise(async (resolveMail, rejectMail) => {
                console.log(`Getting mail ${uid} content...`);
                const fetchStruct = this.imap.seq.fetch(uid, {
                    struct: true
                });
                const partID = await new Promise<string | undefined>((resolve, reject) => {
                    let partID: string | undefined;
                    fetchStruct.on('message', (msg) => {
                        msg.once('attributes', (attrs) => {
                            partID = findTextPart(attrs.struct);
                        });
                    })
                    fetchStruct.once('error', reject);
                    fetchStruct.once('end', () => {
                        resolve(partID);
                    });
                });

                if (partID) {
                    const emailData: ReceivedEmail = {
                        from: '',
                        subject: '',
                        date: '',
                        content: '',
                    };
                    const fetch = this.imap.seq.fetch(uid, {
                        bodies: [
                            'HEADER.FIELDS (FROM)',
                            'HEADER.FIELDS (SUBJECT)',
                            partID
                        ],
                        struct: true
                    });
                    fetch.on('message', (msg) => {
                        msg.on('body', async (stream, info) => {
                            const content = await streamToString(stream);
                            if (info.which === partID) {
                                console.log("text:", content);
                                emailData.content = content;
                            } else if (info.which === 'HEADER.FIELDS (FROM)') {
                                console.log("FROM:", content);
                                const email = content.match(/<(.*?)>/);
                                emailData.from = email && email?.length > 1 ? email[1] : "";
                            }
                            else if (info.which === 'HEADER.FIELDS (SUBJECT)') {
                                console.log("SUBJECT:", content);
                                emailData.subject = content;
                            }
                        });
                        msg.once('attributes', (attrs) => {
                            console.log("DATE: ", attrs.date);
                        });
                    })
                    fetch.once('error', rejectMail)
                    fetch.once('end', () => {
                        result.push(emailData);
                        this.imap.setFlags(uid, ['\\Seen'], () => { });
                        resolveMail(emailData);
                        console.log(`Successfully got ${uid} content!`);
                    });
                }

            })));
        return result;
    }
}

export { MailListener };