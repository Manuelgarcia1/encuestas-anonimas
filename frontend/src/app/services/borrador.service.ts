import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DraftQuestionsService {
  private readonly STORAGE_KEY = 'draftQuestions';
  private questionsSubject = new BehaviorSubject<any[]>(this.loadDraft());
  questions$ = this.questionsSubject.asObservable();

  addQuestion(question: any) {
    const updated = [...this.questionsSubject.value, question];
    this.questionsSubject.next(updated);
    this.saveDraft(updated);
  }

  updateQuestions(questions: any[]) {
    this.questionsSubject.next(questions);
    this.saveDraft(questions);
  }

  clearDraft() {
    this.questionsSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveDraft(questions: any[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
  }

  private loadDraft(): any[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
}
