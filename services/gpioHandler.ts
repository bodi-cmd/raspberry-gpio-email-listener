import { Gpio } from 'onoff';

class GPIO {
    relayPins: Record<number, Gpio> = {}

    constructor() {
        if (process.env.SYSTEM_OS === 'linux') {
            if (process.env.RELAY_1_PIN) {
                this.relayPins[1] = new Gpio(parseInt(process.env.RELAY_1_PIN), 'out')
            }
            if (process.env.RELAY_2_PIN) {
                this.relayPins[2] = new Gpio(parseInt(process.env.RELAY_2_PIN), 'out')
            }
        }
    }

    setRelay(relay: number, value: boolean) {
        try {
            if (this.relayPins[relay]) {
                this.relayPins[relay].writeSync(value ? 1 : 0);
            } else {
                console.log(`Relay ${relay} pin is not set!`);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

export { GPIO };