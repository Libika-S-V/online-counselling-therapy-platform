import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  PhoneOff, Wifi, WifiOff, Clock, Users, AlertCircle
} from 'lucide-react';

const VideoConsultationPage = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [twilioRoom, setTwilioRoom] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const localTracksRef = useRef([]);
  const screenTrackRef = useRef(null);

  // Format session timer
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
  };

  // Fetch session token from backend
  const fetchSession = useCallback(async () => {
    try {
      const res = await api.get(`/video/session/${appointmentId}`);
      setSessionData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video session.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  // Connect to Twilio Video Room
  const connectToRoom = useCallback(async (token, roomName) => {
    if (!token) {
      // Fallback: show demo UI without Twilio
      setConnectionStatus('demo');
      startTimer();
      toast('Video running in demo mode. Configure Twilio keys for live video.', { icon: '⚠️' });
      // Access local camera for demo
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localTracksRef.current = stream.getTracks();
      } catch (e) {
        console.warn('Camera access denied:', e);
      }
      return;
    }

    try {
      const Video = (await import('twilio-video')).default;
      const room = await Video.connect(token, {
        name: roomName,
        audio: true,
        video: { width: 1280, height: 720 }
      });

      setTwilioRoom(room);
      setConnectionStatus('connected');
      startTimer();

      // Show local participant
      room.localParticipant.videoTracks.forEach(pub => {
        if (localVideoRef.current && pub.track) {
          localVideoRef.current.srcObject = new MediaStream([pub.track.mediaStreamTrack]);
        }
      });

      // Show existing remote participants
      room.participants.forEach(handleParticipantConnected);

      // Handle new participants
      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);

      room.on('disconnected', () => {
        setConnectionStatus('disconnected');
        clearInterval(timerRef.current);
      });

    } catch (err) {
      console.error('Twilio connect error:', err);
      setConnectionStatus('failed');
      toast.error('Failed to connect to video room. Please check your connection.');
    }
  }, []);

  const handleParticipantConnected = (participant) => {
    setParticipants(prev => [...prev, participant.identity]);
    toast.success(`${participant.identity.replace('client-', '').replace('therapist-', '')} joined the session`);

    participant.tracks.forEach(pub => {
      if (pub.isSubscribed && pub.track.kind === 'video') {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = new MediaStream([pub.track.mediaStreamTrack]);
        }
      }
    });

    participant.on('trackSubscribed', track => {
      if (track.kind === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = new MediaStream([track.mediaStreamTrack]);
      }
    });
  };

  const handleParticipantDisconnected = (participant) => {
    setParticipants(prev => prev.filter(id => id !== participant.identity));
    toast(`${participant.identity} left the session`, { icon: '👋' });
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchSession();
      if (data) {
        await connectToRoom(data.token, data.session.roomName);
      }
    };
    init();

    return () => {
      clearInterval(timerRef.current);
      if (twilioRoom) twilioRoom.disconnect();
      localTracksRef.current.forEach(t => t.stop());
      if (screenTrackRef.current) screenTrackRef.current.stop();
    };
  }, []);

  const toggleVideo = () => {
    if (twilioRoom) {
      twilioRoom.localParticipant.videoTracks.forEach(pub => {
        isVideoOn ? pub.track.disable() : pub.track.enable();
      });
    } else {
      // Demo mode
      const videoTrack = localTracksRef.current.find(t => t.kind === 'video');
      if (videoTrack) videoTrack.enabled = !isVideoOn;
    }
    setIsVideoOn(prev => !prev);
  };

  const toggleAudio = () => {
    if (twilioRoom) {
      twilioRoom.localParticipant.audioTracks.forEach(pub => {
        isAudioOn ? pub.track.disable() : pub.track.enable();
      });
    } else {
      const audioTrack = localTracksRef.current.find(t => t.kind === 'audio');
      if (audioTrack) audioTrack.enabled = !isAudioOn;
    }
    setIsAudioOn(prev => !prev);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        if (twilioRoom) {
          twilioRoom.localParticipant.unpublishTrack(screenTrackRef.current);
        }
        screenTrackRef.current = null;
      }
      setIsScreenSharing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = stream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      if (twilioRoom) {
        const { LocalVideoTrack } = await import('twilio-video');
        const twilioScreenTrack = new LocalVideoTrack(screenTrack);
        await twilioRoom.localParticipant.publishTrack(twilioScreenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      screenTrack.onended = () => {
        setIsScreenSharing(false);
        screenTrackRef.current = null;
      };

      setIsScreenSharing(true);
      toast.success('Screen sharing started');
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to share screen.');
      }
    }
  };

  const endSession = async () => {
    if (window.confirm('Are you sure you want to end this session?')) {
      try {
        await api.put(`/video/session/${appointmentId}/status`, { status: 'completed' });
        if (twilioRoom) twilioRoom.disconnect();
        localTracksRef.current.forEach(t => t.stop());
        if (screenTrackRef.current) screenTrackRef.current.stop();
        clearInterval(timerRef.current);
        toast.success('Session ended successfully.');
        navigate('/appointments');
      } catch (err) {
        toast.error('Failed to end session cleanly.');
        navigate('/appointments');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Connecting to video session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-slate-900 p-8 rounded-2xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cannot Join Session</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold">Live Session</span>
          {connectionStatus === 'demo' && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Demo Mode</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg text-white">{formatTime(sessionSeconds)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Users className="w-4 h-4" />
            <span>{participants.length + 1} in session</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === 'connected' || connectionStatus === 'demo' ? (
              <><Wifi className="w-4 h-4 text-green-400" /><span className="text-green-400">Connected</span></>
            ) : (
              <><WifiOff className="w-4 h-4 text-red-400" /><span className="text-red-400">Disconnected</span></>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remote Video */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {participants.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-400 text-center">Waiting for the other participant to join...</p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {participants.length > 0 ? participants[0] : 'Remote'}
          </div>
        </div>

        {/* Local Video */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video">
          <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isVideoOn ? 'opacity-0' : ''}`} />
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff className="w-12 h-12 text-slate-500" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
            You {isScreenSharing ? '(Screen)' : ''}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleVideo}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleAudio}
            title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isAudioOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          <button
            onClick={endSession}
            title="End session"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-lg shadow-red-900/50"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
        <p className="text-slate-500 text-xs text-center mt-3">
          Session is end-to-end encrypted · Room: {sessionData?.session?.roomName}
        </p>
      </div>
    </div>
  );
};

export default VideoConsultationPage;
