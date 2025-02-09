import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './types';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { Calendar as CalendarIcon, Plus, Rss, LogIn, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [user, setUser] = useState(null);
  const [rssUrl, setRssUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  useEffect(() => {
    // Set RSS feed URL based on the deployed domain
    const baseUrl = window.location.origin;
    setRssUrl(`${baseUrl}/api/feed.rss`);
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
      return;
    }

    setEvents(data || []);
  };

  const handleSubmit = async (eventData: Partial<CalendarEvent>) => {
    if (!user) return;

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate,
          end_date: eventData.endDate,
          location: eventData.location,
        })
        .eq('id', editingEvent.id);

      if (error) {
        console.error('Error updating event:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          start_date: eventData.startDate,
          end_date: eventData.endDate,
          location: eventData.location,
          user_id: user.id,
        }]);

      if (error) {
        console.error('Error creating event:', error);
        return;
      }
    }

    await loadEvents();
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !window.confirm('Möchten Sie diesen Termin wirklich löschen?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return;
    }

    await loadEvents();
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({
      email: prompt('Email:') || '',
      password: prompt('Passwort:') || '',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">RSS Kalender</h1>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsFormOpen(true);
                      setEditingEvent(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Termin
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rssUrl);
                      alert('RSS-Feed URL wurde in die Zwischenablage kopiert!');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Rss className="h-4 w-4 mr-2" />
                    RSS Feed
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Anmelden
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {!user ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Willkommen beim RSS Kalender</h2>
            <p className="mt-2 text-gray-600">Bitte melden Sie sich an, um Ihre Termine zu verwalten.</p>
          </div>
        ) : isFormOpen ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}
            </h2>
            <EventForm
              event={editingEvent || {}}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEvent(null);
              }}
            />
          </div>
        ) : (
          <EventList
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

export default App;
