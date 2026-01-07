import io, { Socket } from 'socket.io-client';

class SocketService {
  public socket: Socket | null = null;

  connect(ip: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      this.socket = io(`http://${ip}:5000`, {
        transports: ['websocket'],
        reconnectionAttempts: 3,
      });

      this.socket.on('connect', () => resolve());
      this.socket.on('connect_error', (err) => reject(err));
    });
  }

  shutdown() {
    if (this.socket) {
      this.socket.emit('SHUTDOWN_PI');
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();