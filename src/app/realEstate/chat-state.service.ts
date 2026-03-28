import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  constructor() {}
  private chatOpen$ = new BehaviorSubject<boolean>(false);
  private activeChatId$ = new BehaviorSubject<string | null>(null);

  setChatOpen(isOpen: boolean, chatId?: string) {
    this.chatOpen$.next(isOpen);
    this.activeChatId$.next(isOpen ? chatId ?? null : null);
  }

  isChatOpen() {
    return this.chatOpen$.value;
  }

  getActiveChatId() {
    return this.activeChatId$.value;
  }
}
