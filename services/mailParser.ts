import { KEEP_ALIVE_STATUS } from "./stateManager";

class MailParser {
  private readonly hourRegex = /(\d+)h/g;

  extractHours(text: string): number {
    const matches = text.match(this.hourRegex);
    if (matches?.length) {
      return parseInt(matches[0].replace("h", ""));
    }
    return 0;
  }

  extractCommand(text: string): KEEP_ALIVE_STATUS {
    for (let status of Object.values(KEEP_ALIVE_STATUS)) {
      if (text.includes(status)) {
        return status;
      }
    }
    return KEEP_ALIVE_STATUS.ON;
  }
}

export { MailParser };
