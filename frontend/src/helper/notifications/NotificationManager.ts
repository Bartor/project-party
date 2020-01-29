/**
 * Helper class which allows to display notifications.
 */
export class NotificationManager {
    /**
     * Create a new notifications instance.
     * @param container Where should notifications be displayed.
     * @param animated If notifications should be animated.
     * @param animationTime How long should animation take, in ms.
     */
    constructor(
        private container: HTMLElement,
        private animated: boolean = true,
        private animationTime: number = 200
    ) {
    }

    /**
     * Display a new notification.
     * @param message A message to be displayed.
     * @param timeout How long a message should stay on screen, in ms.
     */
    public notify(message: string, timeout: number = 5000) {
        let notification = document.createElement('p');
        notification.textContent = message;
        if (this.animated) {
            notification.style.transform = 'scale(0)';
            notification.style.transition = `transform ${this.animationTime}ms`;

            setTimeout(() => {
                notification.style.transform = 'scale(1)';
            }, 0);
        }
        this.container.append(notification);

        setTimeout(() => {
            notification.style.transform = 'scale(0)';

            setTimeout(() => {
                this.container.removeChild(notification);
            }, this.animationTime);
        }, timeout);
    }
}
