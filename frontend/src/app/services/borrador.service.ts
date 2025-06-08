import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pregunta } from '../interfaces/pregunta.interface';

@Injectable({ providedIn: 'root' })
export class DraftQuestionsService {
  private readonly STORAGE_KEY = 'draftQuestions';
  private questionsSubject = new BehaviorSubject<Pregunta[]>(this.loadDraft());
  questions$ = this.questionsSubject.asObservable();

  addQuestion(question: Pregunta) {
    const updated = [...this.questionsSubject.value, question];
    this.questionsSubject.next(updated);
    this.saveDraft(updated);
  }

  updateQuestions(questions: Pregunta[]) {
    this.questionsSubject.next(questions);
    this.saveDraft(questions);
  }

  private saveDraft(questions: Pregunta[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
  }

  private loadDraft(): Pregunta[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }
}
