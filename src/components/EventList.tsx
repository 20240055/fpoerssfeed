import React from 'react';
import { CalendarEvent } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Edit, Trash2, Calendar } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {format(new Date(event.startDate), 'PPp', { locale: de })} -{' '}
                  {format(new Date(event.endDate), 'PPp', { locale: de })}
                </span>
              </div>
              {event.location && (
                <p className="mt-1 text-sm text-gray-500">
                  📍 {event.location}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(event)}
                className="text-blue-600 hover:text-blue-800"
                title="Bearbeiten"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="text-red-600 hover:text-red-800"
                title="Löschen"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-center text-gray-500">Keine Termine vorhanden</p>
      )}
    </div>
  );
}
