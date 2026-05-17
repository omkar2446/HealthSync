import { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, PhoneCall, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Peer from 'peerjs';
import { toast } from 'react-toastify';

const Telemedicine = () => {
  const { user } = useAuth();
  
  const [peerId, setPeerId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [connection, setConnection] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, connected
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const myStreamRef = useRef(null);

  useEffect(() => {
    // Get local stream immediately
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myStreamRef.current = stream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
        toast.error('Camera/Microphone permission denied');
      });

    // Initialize PeerJS
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      setPeerId(id);
    });

    newPeer.on('call', (incomingCall) => {
      toast.info('Incoming call! Answering automatically...', { icon: '📞' });
      setCallStatus('connected');
      if (myStreamRef.current) {
        incomingCall.answer(myStreamRef.current);
        setCall(incomingCall);
        
        incomingCall.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });
      }
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
      conn.on('data', (data) => {
        setMessages(prev => [...prev, { text: data, sender: 'remote' }]);
      });
    });

    setPeer(newPeer);

    return () => {
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach(track => track.stop());
      }
      newPeer.destroy();
    };
  }, []);

  const initiateCall = () => {
    if (!targetId) return toast.error('Please enter a target ID');
    if (!myStreamRef.current) return toast.error('Camera not accessible');
    
    setCallStatus('ringing');
    const newCall = peer.call(targetId, myStreamRef.current);
    setCall(newCall);
    
    newCall.on('stream', (remoteStream) => {
      setCallStatus('connected');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });

    // Also connect for chat
    const conn = peer.connect(targetId);
    setConnection(conn);
    conn.on('open', () => {
       toast.success('Connected to remote user!');
    });
    conn.on('data', (data) => {
      setMessages(prev => [...prev, { text: data, sender: 'remote' }]);
    });
  };

  const endCall = () => {
    if (call) call.close();
    if (connection) connection.close();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCall(null);
    setConnection(null);
    setCallStatus('idle');
    toast.info('Call ended');
  };

  const toggleMute = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !connection) return;
    
    connection.send(chatInput);
    setMessages(prev => [...prev, { text: chatInput, sender: 'me' }]);
    setChatInput('');
  };

  const copyMyId = () => {
    navigator.clipboard.writeText(peerId);
    toast.success('ID copied to clipboard!');
  };

  return (
    <div className="h-[calc(100vh-10rem)] bg-slate-900 flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-editorial animate-enter">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Pre-call setup */}
        {!call && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Start Telemedicine Call</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Your ID (Share with doctor/patient)</label>
                <div className="flex">
                  <input type="text" readOnly value={peerId || 'Generating...'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-l-xl focus:outline-none font-mono text-sm" />
                  <button onClick={copyMyId} className="bg-slate-200 hover:bg-slate-300 px-4 rounded-r-xl transition-colors">
                    <Copy className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Call ID (Enter their ID to call)</label>
                <input 
                  type="text" 
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Paste ID here..." 
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm" 
                />
              </div>

              <button 
                onClick={initiateCall}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-5 h-5" /> Start Call
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 flex gap-4">
          {/* Main Speaker / Doctor */}
          <div className="flex-1 bg-slate-800 rounded-3xl overflow-hidden relative border border-slate-700 shadow-2xl">
            {callStatus === 'ringing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 z-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-ping opacity-75 absolute"></div>
                <PhoneCall className="w-10 h-10 text-white relative z-10 animate-bounce" />
                <p className="text-white mt-4 font-medium animate-pulse">Ringing remote user...</p>
              </div>
            )}
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white font-medium z-10">
              {callStatus === 'connected' ? 'Remote User' : 'Waiting for connection...'}
            </div>
          </div>

          {/* Self View - Made visible even before call and adjusted z-index to be above overlay */}
          <div className="absolute bottom-6 right-6 w-48 h-64 bg-slate-700 rounded-2xl overflow-hidden border-2 border-slate-600 shadow-xl z-30 hidden md:block">
            <video ref={myVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
                 <VideoOff className="w-8 h-8 text-slate-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-xs z-10">
              {user?.name || 'You'} (You)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="h-24 bg-slate-950 flex items-center justify-center gap-6 px-4">
          <button 
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button onClick={endCall} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg shadow-red-900/50">
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col h-64 md:h-auto relative">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-slate-900">Consultation Chat</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-sm text-slate-500 mt-4">No messages yet. Connected peers can chat here.</div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
              <div className={`${msg.sender === 'me' ? 'bg-primary text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'} p-3 shadow-sm text-sm max-w-[85%] break-words`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={!connection}
            placeholder={connection ? "Type a message..." : "Connect to chat..."} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm disabled:opacity-50"
          />
        </form>
      </div>
    </div>
  );
};

export default Telemedicine;
