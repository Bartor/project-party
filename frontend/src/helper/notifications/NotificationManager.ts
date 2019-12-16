export class NotificationManager {
    constructor(
        private container: HTMLElement,
        private animated: boolean = true
    ) {
    }

    public notify(message: string, timeout: number = 5000) {
        let notification = document.createElement('p');
        notification.textContent = message;
        this.container.append(notification);
        setTimeout(() => {
            this.container.removeChild(notification);
        }, timeout);
    }
}
