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

    private zIdx = 1;

    /**
     * Display a new notification.
     * @param message A message to be displayed.
     * @param timeout Provide a timeout if you want to clear it automatically.
     * @return Function to clear notification.
     */
    public notify(message: string, timeout: number = -1): () => void {
        const container = document.createElement('div');
        const notification = document.createElement('p');
        notification.textContent = message;
        if (this.animated) {
            container.style.transform = 'scale(0)';
            container.style.zIndex = `${this.zIdx++}`;
            container.style.transition = `transform ${this.animationTime}ms`;

            setTimeout(() => {
                container.style.transform = 'scale(1)';
            }, 0);
        }
        container.append(notification);
        this.container.append(container);

        const ret = () => {
            container.style.transform = 'scale(0)';

            setTimeout(() => {
                this.container.removeChild(container);
            }, this.animationTime);
        };

        if (timeout > 0) setTimeout(ret, timeout);
        return ret;
    }
}
