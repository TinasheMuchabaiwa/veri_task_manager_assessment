import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../auth/auth.service';
import { TaskService } from '../tasks/task.service';
import { User } from '../models/user.model';
import { Task, TaskStatus, TaskRequest } from '../models/task.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  isLoading = false;
  isCreatingTask = false;

  // New task form
  newTaskTitle = '';
  newTaskDescription = '';
  showNewTaskForm = false;

  // Edit task
  editingTask: Task | null = null;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Failed to load tasks', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  showCreateForm(): void {
    this.showNewTaskForm = true;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
  }

  hideCreateForm(): void {
    this.showNewTaskForm = false;
    this.newTaskTitle = '';
    this.newTaskDescription = '';
  }

  createTask(): void {
    if (!this.newTaskTitle.trim()) {
      this.snackBar.open('Task title is required', 'Close', { duration: 3000 });
      return;
    }

    this.isCreatingTask = true;
    const taskRequest: TaskRequest = {
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim() || undefined,
      status: TaskStatus.PENDING
    };

    this.taskService.createTask(taskRequest).subscribe({
      next: (newTask) => {
        this.tasks.unshift(newTask);
        this.hideCreateForm();
        this.isCreatingTask = false;
        this.snackBar.open('Task created successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.snackBar.open('Failed to create task', 'Close', { duration: 5000 });
        this.isCreatingTask = false;
      }
    });
  }

  startEdit(task: Task): void {
    this.editingTask = { ...task };
  }

  cancelEdit(): void {
    this.editingTask = null;
  }

  updateTask(): void {
    if (!this.editingTask || !this.editingTask.title.trim()) {
      this.snackBar.open('Task title is required', 'Close', { duration: 3000 });
      return;
    }

    const taskRequest: TaskRequest = {
      title: this.editingTask.title.trim(),
      description: this.editingTask.description?.trim() || undefined,
      status: this.editingTask.status
    };

    this.taskService.updateTask(this.editingTask.id, taskRequest).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.editingTask = null;
        this.snackBar.open('Task updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.snackBar.open('Failed to update task', 'Close', { duration: 5000 });
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    const newStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING;
    const taskRequest: TaskRequest = {
      title: task.title,
      description: task.description,
      status: newStatus
    };

    this.taskService.updateTask(task.id, taskRequest).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        const statusText = newStatus === TaskStatus.COMPLETED ? 'completed' : 'pending';
        this.snackBar.open(`Task marked as ${statusText}!`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.snackBar.open('Failed to update task status', 'Close', { duration: 5000 });
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.snackBar.open('Task deleted successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.snackBar.open('Failed to delete task', 'Close', { duration: 5000 });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter(task => task.status === TaskStatus.PENDING);
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.status === TaskStatus.COMPLETED);
  }
}