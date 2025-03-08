import fs from 'fs';


class StateManager {

    getSchedule(): { user: string, startupTime: Date, shutdownTime: Date } | undefined {
        try {
            const state = fs.readFileSync('./states/uptimeSchedule.csv', 'utf-8');
            if (!state) {
                return undefined;
            }
            const lines = state.trim().split('\n');
            const lastLine = lines[lines.length - 1];

            const [userMail, startDate, endDate] = lastLine.split(';');

            return {
                user: userMail,
                startupTime: new Date(startDate),
                shutdownTime: new Date(endDate)
            }

        } catch (error) {
            return undefined;
        }
    }

    saveSchedule(user: string, startupTime: Date, shutdownTime: Date) {
        try {
            fs.appendFileSync('./states/uptimeSchedule.csv', `${user};${startupTime.toISOString()};${shutdownTime.toISOString()}\n`);
        } catch (error) {
            console.error(error);
        }
    }
}

export { StateManager };