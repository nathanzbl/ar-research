import React, { useEffect, useState } from 'react';
import { SurveyAnalytics } from '../components/Analytics/SurveyAnalytics';

interface SessionResponse {
  id: string;
  conditionType: string;
  deviceType: string;
  startedAt: string;
  completedAt: string | null;
  isScreenedOut: boolean;
  responses: Record<string, string>;
}

const QUESTION_LABELS: Record<string, string> = {
  Q1: 'Are you 18 or older?',
  Q2: 'Are you a current BYU student?',
  Q3: 'What item did you choose from the menu?',
  Q3b: 'Before today, how familiar were you with the item you chose?',
  Q4: 'Did the price of this item influence your choice?',
  Q5: 'Did the expected flavor influence your choice?',
  Q6: 'Did past experience with this dish influence your choice?',
  Q6b: 'About what percentage of the menu did you explore?',
  Q6c: 'About how long did it take you to make your decision?',
  Q6d: 'How confident are you that the item you chose will make you happy?',
  Q6e: 'What was your overall experience navigating this menu?',
  Q7a: 'This menu made it easy to find what I was looking for.',
  Q7b: 'This menu made it easy to compare options.',
  Q7c: 'This menu helped me feel confident in my decision.',
  Q7d: 'This menu made me feel overwhelmed.',
  Q7e: 'This menu made me feel curious about the food.',
  Q7f: 'This menu made me feel excited to order.',
  Q8a: 'The visual design of this menu was appealing.',
  Q8b: 'The layout of this menu was intuitive.',
  Q8c: 'The information presented was sufficient to make a decision.',
  Q8d: 'The menu was easy to navigate.',
  Q8e: 'The menu items were clearly described.',
  Q8f: 'The menu felt modern and up-to-date.',
  Q10: 'How confident are you in your choice? (%)',
  Q11: 'This menu felt realistic for a real restaurant.',
  Q12: 'This menu felt innovative.',
  Q13: 'I felt engaged while using this menu.',
  Q14: 'What did you like most about this menu?',
  Q15: 'What did you find confusing or frustrating?',
  Q16: 'How does this menu compare to other menus you\'ve used in restaurants?',
  Q17: 'What is your age?',
  Q18: 'What is your gender?',
  Q19: 'What is your major/field of study?',
  Q25: 'Have you ever used augmented reality (AR) technology before?',
  Q26: 'To what extent have you used augmented reality (AR)?',
  Q27: 'In general, when I go to a restaurant, price plays a role in what I order.',
  menu_view_duration: 'Time spent viewing menu (seconds)',
};

const ADMIN_PASSWORD = 'desmeb-kuqwy1-qamfAt';

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    screenedOut: number;
    byCondition: Record<string, number>;
  } | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [responsesRes, statsRes] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/stats'),
      ]);

      if (!responsesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const responsesData = await responsesRes.json();
      const statsData = await statsRes.json();

      setSessions(responsesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = '/api/admin/export';
  };

  const handleSessionClick = (session: SessionResponse) => {
    setSelectedSession(session);
    setEditingQuestion(null);
    setEditValue('');
  };

  const handleCloseDetail = () => {
    setSelectedSession(null);
    setEditingQuestion(null);
    setEditValue('');
  };

  const handleEditStart = (questionId: string, currentValue: string) => {
    setEditingQuestion(questionId);
    setEditValue(currentValue);
  };

  const handleEditSave = async () => {
    if (!selectedSession || !editingQuestion) return;

    try {
      const res = await fetch(`/api/admin/session/${selectedSession.id}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: editingQuestion,
          responseValue: editValue,
        }),
      });

      if (!res.ok) throw new Error('Failed to update response');

      // Update local state
      setSelectedSession({
        ...selectedSession,
        responses: {
          ...selectedSession.responses,
          [editingQuestion]: editValue,
        },
      });
      setSessions(sessions.map(s =>
        s.id === selectedSession.id
          ? { ...s, responses: { ...s.responses, [editingQuestion]: editValue } }
          : s
      ));
      setEditingQuestion(null);
      setEditValue('');
    } catch (err) {
      alert('Failed to save changes');
    }
  };

  const handleEditCancel = () => {
    setEditingQuestion(null);
    setEditValue('');
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/session/${sessionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete session');

      // Update local state
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      setDeleteConfirm(null);
      // Refresh stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filterCondition === 'all') return true;
    return session.conditionType === filterCondition;
  });

  // Sort question IDs in logical order
  const sortQuestionIds = (responses: Record<string, string>) => {
    const order = ['Q1', 'Q2', 'menu_view_duration', 'Q3', 'Q3b', 'Q4', 'Q5', 'Q6', 'Q6b', 'Q6c', 'Q6d', 'Q6e',
      'Q7a', 'Q7b', 'Q7c', 'Q7d', 'Q7e', 'Q7f', 'Q8a', 'Q8b', 'Q8c', 'Q8d', 'Q8e', 'Q8f',
      'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q17', 'Q18', 'Q19', 'Q25', 'Q26', 'Q27'];
    return Object.keys(responses).sort((a, b) => {
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-byu-dark mb-6 text-center">Admin Login</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === ADMIN_PASSWORD) {
                sessionStorage.setItem('admin_authenticated', 'true');
                setAuthenticated(true);
                setPasswordError(false);
              } else {
                setPasswordError(true);
              }
            }}
          >
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              placeholder="Enter password"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 focus:border-byu-navy focus:outline-none"
              autoFocus
            />
            {passwordError && (
              <p className="text-byu-error text-sm mb-4">Incorrect password.</p>
            )}
            <button
              type="submit"
              className="w-full bg-byu-navy text-white py-3 rounded-lg font-medium hover:bg-byu-royal transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-byu-navy mx-auto"></div>
          <p className="mt-4 text-byu-gray">Loading responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-byu-error">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-byu-navy text-white py-2 px-4 rounded-lg hover:bg-byu-royal"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-byu-navy text-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/70 text-sm">AR Menu Survey Responses</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-white text-byu-navy py-2 px-4 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-byu-gray">Total Sessions</p>
              <p className="text-3xl font-bold text-byu-dark">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-byu-gray">Completed</p>
              <p className="text-3xl font-bold text-byu-success">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-byu-gray">Screened Out</p>
              <p className="text-3xl font-bold text-byu-error">{stats.screenedOut}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-byu-gray">Completion Rate</p>
              <p className="text-3xl font-bold text-byu-navy">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Condition Breakdown */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-byu-dark mb-4">Responses by Condition</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-byu-navy/5 rounded-lg border border-byu-navy/20">
                <p className="text-sm text-byu-gray">AR Menu (Mobile)</p>
                <p className="text-2xl font-bold text-byu-navy">{stats.byCondition.ar_menu || 0}</p>
              </div>
              <div className="text-center p-4 bg-byu-royal/5 rounded-lg border border-byu-royal/20">
                <p className="text-sm text-byu-gray">Menu Image 1</p>
                <p className="text-2xl font-bold text-byu-royal">{stats.byCondition.menu_image_0 || 0}</p>
              </div>
              <div className="text-center p-4 bg-byu-info/5 rounded-lg border border-byu-info/20">
                <p className="text-sm text-byu-gray">Menu Image 2</p>
                <p className="text-2xl font-bold text-byu-info">{stats.byCondition.menu_image_1 || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-4">
          <label className="text-sm text-byu-gray mr-2">Filter by condition:</label>
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-byu-navy focus:outline-none"
          >
            <option value="all">All</option>
            <option value="ar_menu">AR Menu (Mobile)</option>
            <option value="menu_image_0">Menu Image 1</option>
            <option value="menu_image_1">Menu Image 2</option>
          </select>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Session ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Condition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Responses</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-byu-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSessionClick(session)}
                  >
                    <td className="px-4 py-3 text-sm text-byu-dark font-mono">
                      {session.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        session.conditionType === 'ar_menu'
                          ? 'bg-byu-navy/10 text-byu-navy'
                          : session.conditionType === 'menu_image_0'
                          ? 'bg-byu-royal/10 text-byu-royal'
                          : 'bg-byu-info/10 text-byu-info'
                      }`}>
                        {session.conditionType === 'ar_menu' ? 'AR Menu' :
                         session.conditionType === 'menu_image_0' ? 'Menu Image 1' :
                         session.conditionType === 'menu_image_1' ? 'Menu Image 2' :
                         session.conditionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-byu-gray">{session.deviceType}</td>
                    <td className="px-4 py-3 text-sm text-byu-gray">
                      {new Date(session.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {session.isScreenedOut ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-byu-error/10 text-byu-error">
                          Screened Out
                        </span>
                      ) : session.completedAt ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-byu-success/10 text-byu-success">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-byu-warning/10 text-byu-warning">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-byu-gray">
                      {Object.keys(session.responses || {}).length} answers
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(session.id);
                        }}
                        className="text-byu-error hover:text-byu-error-light text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-byu-gray">
              No responses found
            </div>
          )}
        </div>

        {/* Analytics Charts */}
        <SurveyAnalytics sessions={filteredSessions} />
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-byu-navy text-white">
              <div>
                <h2 className="text-xl font-bold">Session Details</h2>
                <p className="text-sm text-white/70 font-mono">{selectedSession.id}</p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-white/70 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {/* Session Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-byu-gray uppercase font-semibold">Condition</p>
                  <p className="font-medium text-byu-dark">
                    {selectedSession.conditionType === 'ar_menu' ? 'AR Menu' :
                     selectedSession.conditionType === 'menu_image_0' ? 'Menu Image 1' :
                     selectedSession.conditionType === 'menu_image_1' ? 'Menu Image 2' :
                     selectedSession.conditionType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-byu-gray uppercase font-semibold">Device</p>
                  <p className="font-medium text-byu-dark">{selectedSession.deviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-byu-gray uppercase font-semibold">Started</p>
                  <p className="font-medium text-byu-dark">{new Date(selectedSession.startedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-byu-gray uppercase font-semibold">Status</p>
                  <p className="font-medium text-byu-dark">
                    {selectedSession.isScreenedOut ? 'Screened Out' :
                     selectedSession.completedAt ? 'Completed' : 'In Progress'}
                  </p>
                </div>
              </div>

              {/* Responses */}
              <h3 className="text-lg font-semibold text-byu-dark mb-4">Responses</h3>
              {Object.keys(selectedSession.responses || {}).length === 0 ? (
                <p className="text-byu-gray">No responses recorded</p>
              ) : (
                <div className="space-y-3">
                  {sortQuestionIds(selectedSession.responses).map((questionId) => (
                    <div
                      key={questionId}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-byu-navy">
                          {questionId}: {QUESTION_LABELS[questionId] || 'Unknown Question'}
                        </p>
                        {editingQuestion !== questionId && (
                          <button
                            onClick={() => handleEditStart(questionId, selectedSession.responses[questionId])}
                            className="text-byu-royal hover:text-byu-navy text-xs font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {editingQuestion === questionId ? (
                        <div className="mt-2">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-byu-navy focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleEditSave}
                              className="bg-byu-navy text-white px-3 py-1 rounded text-sm font-medium hover:bg-byu-royal"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="bg-gray-100 text-byu-dark px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 border border-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-byu-dark">{selectedSession.responses[questionId]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setDeleteConfirm(selectedSession.id)}
                className="bg-byu-error text-white px-4 py-2 rounded-lg font-medium hover:bg-byu-error-light"
              >
                Delete Session
              </button>
              <button
                onClick={handleCloseDetail}
                className="bg-gray-100 text-byu-dark px-4 py-2 rounded-lg font-medium hover:bg-gray-200 border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-byu-dark mb-2">Confirm Delete</h3>
            <p className="text-byu-gray mb-6">
              Are you sure you want to delete this session? This action cannot be undone and will remove all associated responses.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-100 text-byu-dark px-4 py-2 rounded-lg font-medium hover:bg-gray-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-byu-error text-white px-4 py-2 rounded-lg font-medium hover:bg-byu-error-light"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
