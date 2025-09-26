import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TaskService } from '../../tasks/task.service';
import { Task, TaskStatus, TaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-completed-tasks',
  templateUrl: './completed-tasks.component.html',
  styleUrls: ['./completed-tasks.component.scss']
})
export class CompletedTasksComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = false;
  isUpdating = false;

  // Edit task
  editingTask: Task | null = null;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
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

    this.isUpdating = true;
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
        this.isUpdating = false;
        this.snackBar.open('Task updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.snackBar.open('Failed to update task', 'Close', { duration: 5000 });
        this.isUpdating = false;
      }
    });
  }

  markAsPending(task: Task): void {
    this.isUpdating = true;
    const taskRequest: TaskRequest = {
      title: task.title,
      description: task.description,
      status: TaskStatus.PENDING
    };

    this.taskService.updateTask(task.id, taskRequest).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.isUpdating = false;
        this.snackBar.open('Task marked as pending!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.snackBar.open('Failed to update task status', 'Close', { duration: 5000 });
        this.isUpdating = false;
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

  markAllPending(): void {
    if (this.completedTasks.length === 0) return;

    const confirmMessage = `Are you sure you want to mark all ${this.completedTasks.length} completed tasks as pending?`;
    if (confirm(confirmMessage)) {
      this.isUpdating = true;
      const updatePromises = this.completedTasks.map(task => {
        const taskRequest: TaskRequest = {
          title: task.title,
          description: task.description,
          status: TaskStatus.PENDING
        };
        return this.taskService.updateTask(task.id, taskRequest).toPromise();
      });

      Promise.all(updatePromises).then(updatedTasks => {
        updatedTasks.forEach(updatedTask => {
          if (updatedTask) {
            const index = this.tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
          }
        });
        this.isUpdating = false;
        this.snackBar.open('All tasks marked as pending!', 'Close', { duration: 3000 });
      }).catch(error => {
        console.error('Error updating tasks:', error);
        this.snackBar.open('Failed to update some tasks', 'Close', { duration: 5000 });
        this.isUpdating = false;
      });
    }
  }

  deleteAllCompleted(): void {
    if (this.completedTasks.length === 0) return;

    const confirmMessage = `Are you sure you want to delete all ${this.completedTasks.length} completed tasks? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.isUpdating = true;
      const deletePromises = this.completedTasks.map(task =>
        this.taskService.deleteTask(task.id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.tasks = this.tasks.filter(t => t.status !== TaskStatus.COMPLETED);
        this.isUpdating = false;
        this.snackBar.open('All completed tasks deleted!', 'Close', { duration: 3000 });
      }).catch(error => {
        console.error('Error deleting tasks:', error);
        this.snackBar.open('Failed to delete some tasks', 'Close', { duration: 5000 });
        this.isUpdating = false;
      });
    }
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.status === TaskStatus.COMPLETED);
  }

  trackByTaskId(_: number, task: Task): number {
    return task.id;
  }
}