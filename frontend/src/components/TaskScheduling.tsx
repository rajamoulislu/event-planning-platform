// app/events/[id]/tasks/page.tsx
'use client';
import axios from 'axios';
import { Event, Task } from '@/interface';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '@/css/TaskScheduling.module.css';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';

export default function TaskSchedulingPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;
    const [event, setEvent] = useState<Event | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        priority: 'medium',
        assignedTo: ''
    });

    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
            fetchTasks();
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/events/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/events/${eventId}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleAddTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/events/${eventId}/tasks`, {
                ...newTask,
                eventId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchTasks();
            setIsModalOpen(false);
            setNewTask({
                title: '',
                description: '',
                startDate: new Date(),
                endDate: new Date(),
                priority: 'medium',
                assignedTo: ''
            });
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleUpdateTask = async () => {
        if (!editingTask) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/events/${eventId}/tasks/${editingTask.id}`, {
                ...newTask,
                eventId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchTasks();
            setIsModalOpen(false);
            setEditingTask(null);
            setNewTask({
                title: '',
                description: '',
                startDate: new Date(),
                endDate: new Date(),
                priority: 'medium',
                assignedTo: ''
            });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleToggleTaskComplete = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/events/${eventId}/tasks/${taskId}/toggle`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Refresh tasks after toggling completion status
            fetchTasks();
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description || '',
            startDate: new Date(task.startDate),
            endDate: task.endDate ? new Date(task.endDate) : new Date(),
            priority: task.priority || 'medium',
            assignedTo: task.assignedTo || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmitTask = () => {
        if (editingTask) {
            handleUpdateTask();
        } else {
            handleAddTask();
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    const goToPreviousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const goToNextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    const renderWeekDays = () => {
        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
            <div className={styles.weekRow}>
                {weekDays.map((day, index) => (
                    <div key={index} className={styles.weekDay}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCalendarDays = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 0 });
        const end = endOfWeek(currentDate, { weekStartsOn: 0 });
        const days = [];
        let day = start;

        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }

        return (
            <div className={styles.calendarRow}>
                {days.map((date, i) => (
                    <div
                        key={i}
                        className={`${styles.calendarDay} ${isSameDay(date, selectedDate) ? styles.selectedDay : ''}`}
                        onClick={() => setSelectedDate(date)}
                    >
                        {format(date, 'd')}
                    </div>
                ))}
            </div>
        );
    };

    const renderTasksForSelectedDate = () => {
        const filteredTasks = tasks.filter(task => {
            const taskDate = parseISO(task.startDate.toString());
            return isSameDay(taskDate, selectedDate);
        });

        if (filteredTasks.length === 0) {
            return <div className={styles.emptyListMessage}>No tasks scheduled for this date</div>;
        }

        return (
            <div className={styles.taskList}>
                {filteredTasks.map((task, index) => (
                    <div key={index} className={styles.taskItem}>
                        <div className={styles.taskHeader}>
                            <h4>{task.title}</h4>
                            <span className={`${styles.taskPriority} ${styles[task.priority || 'medium']}`}>
                                {task.priority}
                            </span>
                        </div>
                        {task.description && <p className={styles.taskDescription}>{task.description}</p>}
                        <div className={styles.taskMeta}>
                            <span>Time: {format(parseISO(task.startDate.toString()), 'h:mm a')}</span>
                            {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
                        </div>
                        <div className={styles.taskActions}>
                            <button
                                className={styles.completeButton}
                                onClick={() => handleToggleTaskComplete(task.id)}
                            >
                                {task.completed ? 'Completed' : 'Mark Complete'}
                            </button>
                            <button
                                className={styles.editButton}
                                onClick={() => handleEditTask(task)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loader}></div>
            </div>
        );
    }

    if (!event) {
        return <div className={styles.error}>Event not found</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => router.push(`/events/${eventId}`)} className={styles.backButton}>
                    ← Back to Event
                </button>
                <h1 className={styles.title}>{event.title} - Task Scheduling</h1>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.detailsTab}>
                    <h3>Task Management</h3>
                    <p>Stay on top of every task and never miss a deadline.</p>

                    <div className={styles.monthHeader}>
                        <span className={styles.monthName}>{format(currentDate, 'MMMM yyyy')}</span>
                        <div className={styles.calendarControls}>
                            <button onClick={goToToday} className={styles.todayButton}>
                                Today
                            </button>
                            <button onClick={goToPreviousWeek} className={styles.navButton}>
                                ◀
                            </button>
                            <button onClick={goToNextWeek} className={styles.navButton}>
                                ▶
                            </button>
                        </div>
                    </div>

                    {renderWeekDays()}
                    {renderCalendarDays()}

                    <div className={styles.tasksSection}>
                        <div className={styles.tasksSectionHeader}>
                            <h3>Tasks for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                            <button
                                className={styles.addItemButton}
                                onClick={() => {
                                    setEditingTask(null);
                                    setNewTask({
                                        title: '',
                                        description: '',
                                        startDate: selectedDate,
                                        endDate: selectedDate,
                                        priority: 'medium',
                                        assignedTo: ''
                                    });
                                    setIsModalOpen(true);
                                }}
                            >
                                + Add Task
                            </button>
                        </div>
                        {renderTasksForSelectedDate()}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                className={styles.textInput}
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                className={styles.editDescriptionInput}
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Start Date</label>
                                <input
                                    className={styles.dateInput}
                                    type="datetime-local"
                                    value={format(newTask.startDate, "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => setNewTask({ ...newTask, startDate: new Date(e.target.value) })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>End Date</label>
                                <input
                                    className={styles.dateInput}
                                    type="datetime-local"
                                    value={format(newTask.endDate, "yyyy-MM-dd'T'HH:mm")}
                                    onChange={(e) => setNewTask({ ...newTask, endDate: new Date(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Priority</label>
                                <select
                                    className={styles.textInput}
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Assigned To</label>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingTask(null);
                                    setNewTask({
                                        title: '',
                                        description: '',
                                        startDate: new Date(),
                                        endDate: new Date(),
                                        priority: 'medium',
                                        assignedTo: ''
                                    });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className={editingTask ? styles.editButton : styles.saveButton}
                                onClick={handleSubmitTask}
                            >
                                {editingTask ? 'Update Task' : 'Save Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}