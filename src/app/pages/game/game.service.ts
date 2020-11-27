import { Injectable } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs';
import { GameEvents, GameUpdate } from './game';

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }

    public send(gameUpdate: GameUpdate): void {
        //this.socket.emit('gameUpdate', gameUpdate);
    }

    public onGameUpdate(): Observable<GameUpdate> {
        return new Observable<GameUpdate>(observer => {
            this.socket.on('gameUpdate', (data: GameUpdate) => observer.next(data));
        });
    }

    public onEvent(event: GameEvents): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}