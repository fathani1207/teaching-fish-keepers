import type { Event } from "../types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-40 object-cover rounded-lg mb-2"
        />
      )}
      <h3 className="text-xl font-semibold text-blue-800">{event.title}</h3>
      <p className="text-sm text-blue-600">{formatDate(event.date)}</p>
      {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
      {event.description && <p className="text-gray-600 mt-1">{event.description}</p>}
      {event.max_participants && (
        <p className="text-xs text-gray-400 mt-auto">{event.max_participants} participants max</p>
      )}
    </div>
  );
}
