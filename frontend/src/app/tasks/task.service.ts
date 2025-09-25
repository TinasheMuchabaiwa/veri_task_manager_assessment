import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Task, TaskRequest } from '../models/task.model';

interface StandardResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<StandardResponse<Task[]>>(this.apiUrl)
      .pipe(map(response => response.data));
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<StandardResponse<Task>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  createTask(taskRequest: TaskRequest): Observable<Task> {
    return this.http.post<StandardResponse<Task>>(this.apiUrl, taskRequest)
      .pipe(map(response => response.data));
  }

  updateTask(id: number, taskRequest: TaskRequest): Observable<Task> {
    return this.http.put<StandardResponse<Task>>(`${this.apiUrl}/${id}`, taskRequest)
      .pipe(map(response => response.data));
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}