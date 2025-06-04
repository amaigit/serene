import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TaskCalendarProps {
  onEdit: (taskId: Id<"tasks">) => void;
}

export function TaskCalendar({ onEdit }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get start and end of current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const tasks = useQuery(api.tasks.getTasksForCalendar, {
    startDate: startOfMonth.getTime(),
    endDate: endOfMonth.getTime(),
  });

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    if (!tasks) return [];
    
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate).toDateString() : null;
      const scheduledDate = task.scheduledDate ? new Date(task.scheduledDate).toDateString() : null;
      return dueDate === dateStr || scheduledDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const days = getDaysInMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-100 ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getTasksForDate(day).slice(0, 3).map(task => (
                      <div
                        key={task._id}
                        onClick={() => onEdit(task._id)}
                        className={`text-xs p-1 rounded cursor-pointer text-white truncate ${getPriorityColor(task.priority)}`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {getTasksForDate(day).length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{getTasksForDate(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
