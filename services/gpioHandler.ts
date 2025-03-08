import gpiop from 'rpi-gpio';

class GPIO {
    relayPins: Record<number, number> = {}

    readonly isProduction;

    pinInitialisation: Promise<void[]>;

    constructor() {
        this.isProduction = process.env.SYSTEM_OS === 'linux'
        if (process.env.RELAY_1_PIN) {
            this.relayPins[1] = parseInt(process.env.RELAY_1_PIN);
        }
        if (process.env.RELAY_2_PIN) {
            this.relayPins[2] = parseInt(process.env.RELAY_2_PIN);
        }
        this.pinInitialisation = this.initPins();
    }

    initPins() {
        return Promise.all(
            Object.entries(this.relayPins).map(([_relay, pin]) =>
                new Promise<void>((resolve, reject) => {
                    if (this.isProduction) {
                        gpiop.setup(pin, gpiop.DIR_OUT, (error) => {
                            if (error) {
                                reject(error);
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }))
        );
    }

    setRelay(relay: number, value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.relayPins[relay]) {
                if (this.isProduction) {
                    gpiop.write(this.relayPins[relay], value, (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve()
                    });
                } else {
                    resolve();
                }
            } else {
                reject(`Relay ${relay} pin is not set!`);
            }
        })
    }
}

export { GPIO };