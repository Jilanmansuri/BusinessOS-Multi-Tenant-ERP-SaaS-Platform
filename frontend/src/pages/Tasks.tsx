import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Tasks() {
  const { token, activeOrganization } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-organization-id": activeOrganization?.id 
        }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  // Fetch organization members
  const { data: members } = useQuery({
    queryKey: ["members", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/organizations/members", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-organization-id": activeOrganization?.id
        }
      });
      return res.data;
    },
    enabled: !!activeOrganization?.id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title,
          description,
          status,
          priority,
          assignedToId: assignedToId || null,
          dueDate: dueDate || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-organization-id": activeOrganization?.id
          }
        }
      );
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setAssignedToId("");
      setDueDate("");
      queryClient.invalidateQueries({ queryKey: ["tasks", activeOrganization?.id] });
      queryClient.invalidateQueries({ queryKey: ["aiInsights", activeOrganization?.id] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Board</h1>
          <p className="text-slate-500">Manage your team's tasks and progress.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn title="TODO" tasks={tasks?.filter((t: any) => t.status === "TODO")} isLoading={isLoading} />
        <TaskColumn title="IN PROGRESS" tasks={tasks?.filter((t: any) => t.status === "IN_PROGRESS")} isLoading={isLoading} />
        <TaskColumn title="DONE" tasks={tasks?.filter((t: any) => t.status === "DONE")} isLoading={isLoading} />
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="TODO" className="text-slate-900 bg-white">Todo</option>
                    <option value="IN_PROGRESS" className="text-slate-900 bg-white">In Progress</option>
                    <option value="DONE" className="text-slate-900 bg-white">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Priority</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW" className="text-slate-900 bg-white">Low</option>
                    <option value="MEDIUM" className="text-slate-900 bg-white">Medium</option>
                    <option value="HIGH" className="text-slate-900 bg-white">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Assignee</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                  >
                    <option value="" className="text-slate-900 bg-white">Unassigned</option>
                    {members?.map((member: any) => (
                      <option key={member.id} value={member.id} className="text-slate-900 bg-white">
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskColumn({ title, tasks, isLoading }: { title: string, tasks: any[], isLoading: boolean }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 min-h-[500px]">
      <h3 className="font-semibold text-sm text-slate-600 mb-4">{title} ({tasks?.length || 0})</h3>
      
      {isLoading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : tasks?.length === 0 ? (
        <div className="text-sm text-slate-400 border-2 border-dashed border-slate-200 p-4 rounded-lg text-center">No tasks</div>
      ) : (
        <div className="space-y-3">
          {tasks?.map(task => (
            <div key={task.id} className="bg-white dark:bg-slate-950 p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-900">{task.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                  task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
              <div className="text-xs font-medium text-slate-400">
                {task.assignedTo?.name ? `Assignee: ${task.assignedTo.name}` : "Unassigned"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
