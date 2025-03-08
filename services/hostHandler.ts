import { exec } from 'node:child_process';
import { GPIO } from './gpioHandler';

const wait = (delay: number) => new Promise<void>(resolve => setTimeout(() => resolve(), delay));

type HostConfig = {
    ip: string;
    powerButtonRelay: number;
}

class HostHandler {

    constructor(readonly config: HostConfig, readonly gpio: GPIO) { }

    isServerOnline(): Promise<boolean> {
        return new Promise((resolve) => {
            console.log("Pinging the server...")
            exec(`ping -c 3 ${this.config.ip}`, (error, stdout) => {
                console.log("Response from ping:", stdout)
                resolve(!error);
            });
        })
    }

    async turnServerOn() {
        console.log("Relay tries to power on the server!")
        try {
            if (await this.isServerOnline()) {
                console.log("The server is already powered on!")
                return;
            }
            this.gpio.setRelay(this.config.powerButtonRelay, true);
            await wait(200);
            this.gpio.setRelay(this.config.powerButtonRelay, false);
        } catch (error) {
            console.log("An error occured during the gpio power on!");
            console.error(error);
            this.gpio.setRelay(this.config.powerButtonRelay, false);
        }
    }

    async turnServerOff() {
        console.log("Relay tries to power off the server!")
        try {
            if (await this.isServerOnline()) {
                this.gpio.setRelay(this.config.powerButtonRelay, true);
                await wait(6000);
                this.gpio.setRelay(this.config.powerButtonRelay, false);
            } else {
                console.log("The server is already powered off!")
            }
        } catch (error) {
            console.log("An error occured during the gpio power off!");
            console.error(error);
            this.gpio.setRelay(this.config.powerButtonRelay, false);
        }
    }
}

export { HostConfig, HostHandler };