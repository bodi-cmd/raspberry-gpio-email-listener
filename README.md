# Node.js Linux Machine Monitor & Controller

## Description
This project uses a **Raspberry Pi** running a **Node.js** process to monitor and control the status of a Linux machine via **ICMP Ping** and a physical wire connected to the power button.

Additionally, the system uses emails for communication, allowing the user to send commands to check or control the status of the Linux machine.

---
## System Architecture

1. **The user** sends an email to a monitored address.
2. **Raspberry Pi** reads emails using the **IMAP** protocol.
3. **Node.js** performs an **ICMP Ping** to check if the Linux machine is online.
   - If it is offline, it can activate the power button using a physical wire connected to the pins.
4. **Node.js** sends a response email via **SMTP** to confirm the action taken.
5. **The user** receives a response with the current status of the Linux machine.

![architecture](https://raw.githubusercontent.com/bodi-cmd/raspberry-gpio-email-listener/refs/heads/main/architecture.png)

---
## Components Used

- **Hardware**:
  - Raspberry Pi
  - Physical wires connected to the power button pins of the Linux machine
  - Relays module
- **Software**:
  - Node.js
  - syscalls for ICMP Ping
  - onoff for GPIO control
  - nodemailer for sending emails
  - imap for reading emails

---
## Installation & Execution

1. Clone the repository:
   ```bash
   git clone https://github.com/user/project.git
   cd project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file with email server details.
4. Run the application:
   ```bash
   npm run dev
   ```

---
## Environment Variables Configuration (`.env` File)

Before running the application, you need to set up the `.env` file with the following configurations:

```
SMTP_HOST=         # SMTP server address
SMTP_EMAIL=        # Email address used for sending messages
SMTP_PASS=         # Password or app-specific password for SMTP authentication

IMAP_HOST=         # IMAP server address
IMAP_EMAIL=        # Email address used for receiving messages
IMAP_PASS=         # Password or app-specific password for IMAP authentication

SYSTEM_OS=windows or linux  # Operating system of the target machine
HOST_IP=         # IP address of the Linux machine to monitor

RELAY_1_PIN=     # GPIO pin number for first relay control
RELAY_2_PIN=     # GPIO pin number for second relay control
```

Ensure that the `.env` file is properly configured before running the application.

---
## Possible Improvements
- Implementing a web panel for control and monitoring
- Support for other communication methods (e.g., Telegram bot)
- Enhancing email security using OAuth2

---
## License
This project is open-source and distributed under the MIT license.

