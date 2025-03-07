class MailParser {


    private readonly hourRegex = /(\d+)h/g;

    extractHours(text: string): number {
        const matches = text.match(this.hourRegex);
        if (matches?.length) {
            return parseInt(matches[0].replace('h', ''));
        }
        return 0;
    }

}

export { MailParser }