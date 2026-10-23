
import React, { useCallback, useEffect, useState } from "react";
import {
  addReviewTaskComment,
  createReviewTask,
  getReviewTaskComments,
  getReviewTaskHistory,
  getReviewTasks,
  updateReviewTask,
  type ReviewTask,
  type ReviewTaskPriority,
  type ReviewTaskStatus,
} from "../../services/reviewTasks";
import "../../styles/ReviewTasksTab.css";

const ReviewTasksTab: React.FC = () => {
  const accessToken = localStorage.getItem("access_token") ?? "";

  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<ReviewTaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] =
    useState<ReviewTaskPriority | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<ReviewTaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [comments, setComments] = useState<
    Array<{ id: string; comment: string; created_at: string }>
  >([]);
  const [history, setHistory] = useState<
    Array<{ id: string; event_type: string; created_at: string }>
  >([]);
  const [commentText, setCommentText] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getReviewTasks(accessToken, {
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, statusFilter, priorityFilter]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError("");

    try {
      await createReviewTask(accessToken, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate
          ? new Date(`${dueDate}T23:59:00`).toISOString()
          : undefined,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    status: ReviewTaskStatus,
  ) => {
    setError("");
    try {
      await updateReviewTask(accessToken, taskId, { status });
      await loadTasks();

      if (selectedTask === taskId) {
        await loadTaskDetails(taskId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task.");
    }
  };

  const loadTaskDetails = async (taskId: string) => {
    setSelectedTask(taskId);
    setError("");

    try {
      const [commentResult, historyResult] = await Promise.all([
        getReviewTaskComments(accessToken, taskId),
        getReviewTaskHistory(accessToken, taskId),
      ]);
      setComments(commentResult.items);
      setHistory(historyResult.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load task details.");
    }
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    try {
      await addReviewTaskComment(
        accessToken,
        selectedTask,
        commentText.trim(),
      );
      setCommentText("");
      await loadTaskDetails(selectedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add comment.");
    }
  };

  const counts = {
    total: tasks.length,
    open: tasks.filter((task) => task.status === "open").length,
    active: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  return (
    <div className="review-tasks-page">
      <div className="review-tasks-heading">
        <div>
          <span className="review-tasks-eyebrow">WORKSPACE MANAGEMENT</span>
          <h1>Review Tasks</h1>
          <p>Assign, track, and complete document review work.</p>
        </div>
        <button
          className="review-refresh-button"
          onClick={() => void loadTasks()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="review-error">{error}</div>}

      <div className="review-task-stats">
        <div><span>Total tasks</span><strong>{counts.total}</strong></div>
        <div><span>Open</span><strong>{counts.open}</strong></div>
        <div><span>In progress</span><strong>{counts.active}</strong></div>
        <div><span>Completed</span><strong>{counts.completed}</strong></div>
      </div>

      <section className="review-panel">
        <h2>Create a review task</h2>
        <form onSubmit={handleCreate} className="review-create-form">
          <label>
            Task title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Review updated compliance policy"
              maxLength={200}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explain what needs to be reviewed..."
              maxLength={5000}
              rows={3}
            />
          </label>

          <div className="review-form-row">
            <label>
              Priority
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as ReviewTaskPriority)
                }
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <label>
              Due date
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>

          <button className="review-primary-button" disabled={saving}>
            {saving ? "Creating..." : "Create task"}
          </button>
        </form>
      </section>

      <section className="review-panel">
        <div className="review-list-heading">
          <div>
            <h2>Task inbox</h2>
            <p>Review the status and priority of each task.</p>
          </div>
          <div className="review-filters">
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ReviewTaskStatus | "")
              }
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value as ReviewTaskPriority | "")
              }
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="review-empty">Loading review tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="review-empty">No tasks found. Create your first review task above.</p>
        ) : (
          <div className="review-task-list">
            {tasks.map((task) => (
              <article className="review-task-card" key={task.id}>
                <div className="review-task-main">
                  <div className="review-task-labels">
                    <span className={`review-priority priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="review-task-id">
                      {task.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="review-task-meta">
                    <span>Due: {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "Not set"}</span>
                    <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="review-task-actions">
                  <select
                    aria-label={`Status for ${task.title}`}
                    value={task.status}
                    onChange={(event) =>
                      void handleStatusChange(
                        task.id,
                        event.target.value as ReviewTaskStatus,
                      )
                    }
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    className="review-secondary-button"
                    onClick={() => void loadTaskDetails(task.id)}
                  >
                    Comments & history
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedTask && (
        <section className="review-panel">
          <div className="review-list-heading">
            <div>
              <h2>Task discussion & history</h2>
              <p>Task ID: {selectedTask}</p>
            </div>
            <button
              className="review-secondary-button"
              onClick={() => setSelectedTask(null)}
            >
              Close
            </button>
          </div>

          <form className="review-comment-form" onSubmit={handleAddComment}>
            <label>
              Add a comment
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a review note..."
                maxLength={2000}
                rows={3}
              />
            </label>
            <button className="review-primary-button" disabled={!commentText.trim()}>
              Add comment
            </button>
          </form>

          <h3>Comments</h3>
          {comments.length === 0 ? (
            <p className="review-empty">No comments yet.</p>
          ) : comments.map((comment) => (
            <div className="review-history-item" key={comment.id}>
              <p>{comment.comment}</p>
              <small>{new Date(comment.created_at).toLocaleString()}</small>
            </div>
          ))}

          <h3>Activity history</h3>
          {history.length === 0 ? (
            <p className="review-empty">No history available.</p>
          ) : history.map((event) => (
            <div className="review-history-item" key={event.id}>
              <strong>{event.event_type.replaceAll("_", " ")}</strong>
              <small>{new Date(event.created_at).toLocaleString()}</small>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ReviewTasksTab;
