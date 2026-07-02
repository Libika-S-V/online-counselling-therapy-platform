import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import ChatBubble from '../components/ChatBubble';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Send, ArrowLeft, Video, ShieldAlert, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SessionChatPage = () => {
  const { id: appointmentId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time state
  const [typingUser, setTypingUser] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [partner, setPartner] = useState(null); // The other person in chat
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial Load: Fetch history & join socket room
  useEffect(() => {
    let isMounted = true;
    
    const fetchHistoryAndSetup = async () => {
      try {
        const [msgRes, appRes] = await Promise.all([
          api.get(`/messages/${appointmentId}`),
          api.get(`/appointments/my`) // We fetch to find our partner info. Alternatively can create a specific endpoint.
        ]);
        
        if (!isMounted) return;
        setMessages(msgRes.data);
        
        // Find appointment to get partner info
        const app = appRes.data.find(a => a._id === appointmentId);
        if (app) {
          setSessionCompleted(app.status === 'completed');
          if (user.role === 'client') {
            setPartner(app.therapistId);
          } else {
            setPartner(app.clientId);
          }
        }

        // Join socket room
        if (socket) {
          socket.emit('join_room', { appointmentId });
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history. Ensure you have access to this session.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistoryAndSetup();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, socket, user.role]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  // 2. Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTyping = (data) => {
      if (data.userId !== user.id) {
        setTypingUser(data.isTyping ? data.role : null);
      }
    };

    const handleSessionEnd = (data) => {
      if (data.appointmentId === appointmentId) {
        setSessionCompleted(true);
        toast('Session completed by therapist.', { icon: '✅' });
      }
    };

    const handleError = (data) => {
      toast.error(data.message);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('session_end', handleSessionEnd);
    socket.on('error_message', handleError);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('session_end', handleSessionEnd);
      socket.off('error_message', handleError);
    };
  }, [socket, appointmentId, user.id]);

  // 3. Typing Indication Logic
  let typingTimeout = useRef(null);
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (socket && !sessionCompleted) {
      socket.emit('typing', { appointmentId, isTyping: true });
      
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('typing', { appointmentId, isTyping: false });
      }, 2000);
    }
  };

  // 4. Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sessionCompleted || !socket) return;

    socket.emit('send_message', {
      appointmentId,
      content: inputText.trim()
    });
    
    socket.emit('typing', { appointmentId, isTyping: false });
    setInputText('');
  };

  // 5. End Session Handler (Therapist Only)
  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      socket.emit('session_end', { appointmentId });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="py-12"><ErrorMessage message={error} /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            {partner?.profilePhoto ? (
              <img src={partner.profilePhoto.startsWith('http') ? partner.profilePhoto : `${import.meta.env.VITE_API_BASE_URL}${partner.profilePhoto}`} alt="Partner" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                {partner?.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{partner?.name || 'Session'}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                {sessionCompleted ? (
                  <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>
                ) : (
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Session</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full transition-colors hidden sm:block">
            <Video className="w-5 h-5" />
          </button>
          {user.role === 'therapist' && !sessionCompleted && (
            <button 
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-xl font-medium text-sm transition-colors"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar relative">
        {/* Security Notice */}
        <div className="flex justify-center mb-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border border-amber-200 dark:border-amber-800/30 shadow-sm">
            <ShieldAlert className="w-4 h-4" /> End-to-end encrypted session.
          </div>
        </div>

        {messages.map((msg, idx) => (
          <ChatBubble key={msg._id || idx} message={msg} isOwn={msg.senderId._id === user.id || msg.senderId === user.id} />
        ))}
        
        {typingUser && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl rounded-tl-sm text-sm text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 z-10">
        {sessionCompleted ? (
          <div className="text-center text-slate-500 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            This session has been completed and is now read-only.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center justify-center shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SessionChatPage;
