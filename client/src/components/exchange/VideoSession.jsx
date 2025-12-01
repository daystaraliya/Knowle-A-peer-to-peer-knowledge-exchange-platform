
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSocket } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import Button from '../Button';
import toast from 'react-hot-toast';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

const VideoSession = ({ exchangeId, otherParticipant }) => {
    const socket = useSocket();
    const { user } = useContext(AuthContext);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callState, setCallState] = useState('idle'); // idle, receiving, calling, connected
    const [incomingCall, setIncomingCall] = useState(null); // { offer, callerId }
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isSharingScreen, setIsSharingScreen] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const screenTrackRef = useRef(null);
    const cameraTrackRef = useRef(null);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(servers);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc:ice-candidate', { exchangeId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemoteStream(stream);
        };
        
        return pc;
    };

    const setupLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            cameraTrackRef.current = stream.getVideoTracks()[0];
            return stream;
        } catch (err) {
            toast.error("Could not access camera or microphone. Please check permissions.");
            console.error(err);
            return null;
        }
    };
    
    const startCall = async () => {
        const stream = await setupLocalMedia();
        if (!stream) return;
        
        setCallState('calling');
        const pc = createPeerConnection();
        peerConnectionRef.current = pc;
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc:call', { exchangeId, offer });
    };

    const answerCall = async () => {
        if (!incomingCall) return;

        const stream = await setupLocalMedia();
        if (!stream) return;

        const pc = createPeerConnection();
        peerConnectionRef.current = pc;
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc:answer', { exchangeId, answer });
        setCallState('connected');
        setIncomingCall(null);
    };

    const hangUp = () => {
        socket.emit('webrtc:hangup', { exchangeId });
        closeConnection();
    };
    
    const closeConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setCallState('idle');
        setIncomingCall(null);
        setIsSharingScreen(false);
    };

    useEffect(() => {
        if (socket) {
            const handleOffer = ({ offer, callerId }) => {
                setIncomingCall({ offer, callerId });
                setCallState('receiving');
                toast(`${otherParticipant.fullName} is calling you!`);
            };

            const handleAnswer = async ({ answer }) => {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    setCallState('connected');
                }
            };

            const handleCandidate = ({ candidate }) => {
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            };
            
            const handleHangup = () => {
                toast.error("Call ended.");
                closeConnection();
            };

            socket.on('webrtc:offer-received', handleOffer);
            socket.on('webrtc:answer-received', handleAnswer);
            socket.on('webrtc:ice-candidate-received', handleCandidate);
            socket.on('webrtc:hangup-received', handleHangup);

            return () => {
                socket.off('webrtc:offer-received', handleOffer);
                socket.off('webrtc:answer-received', handleAnswer);
                socket.off('webrtc:ice-candidate-received', handleCandidate);
                socket.off('webrtc:hangup-received', handleHangup);
                hangUp(); // Clean up on component unmount
            };
        }
    }, [socket]);

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !isCameraOn;
            setIsCameraOn(!isCameraOn);
        }
    };

    const toggleScreenShare = async () => {
        if (!isSharingScreen) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenTrackRef.current = screenStream.getVideoTracks()[0];

                const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
                sender.replaceTrack(screenTrackRef.current);
                setIsSharingScreen(true);
                
                screenTrackRef.current.onended = () => {
                    toggleScreenShare(); // Toggle back automatically
                };

            } catch (err) {
                console.error("Screen share error:", err);
            }
        } else {
            const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
            sender.replaceTrack(cameraTrackRef.current);
            screenTrackRef.current.stop();
            setIsSharingScreen(false);
        }
    };

    const renderIdle = () => (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Video Session</h3>
            <p className="text-textSecondary mb-6">Start a video call with {otherParticipant.fullName}.</p>
            <Button onClick={startCall}>Start Video Call</Button>
        </div>
    );
    
    const renderReceiving = () => (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Incoming Call</h3>
            <p className="text-textSecondary mb-6">from {otherParticipant.fullName}</p>
            <div className="space-x-4">
                <Button variant="outline" onClick={() => setCallState('idle')}>Decline</Button>
                <Button variant="secondary" onClick={answerCall}>Accept</Button>
            </div>
        </div>
    );

    const renderCalling = () => (
        <div className="text-center">
            <h3 className="text-xl font-bold animate-pulse">Calling {otherParticipant.fullName}...</h3>
             <Button variant="outline" onClick={hangUp} className="mt-6">Cancel</Button>
        </div>
    );

    const renderConnected = () => (
        <div className="w-full h-full flex flex-col">
            <div className="relative flex-grow grid grid-cols-1 gap-2">
                 <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-black rounded-md" />
                 <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-1/4 max-w-xs h-auto object-cover bg-black rounded-md border-2 border-white" />
            </div>
            <div className="flex-shrink-0 bg-gray-100 p-2 rounded-b-lg flex justify-center items-center space-x-3">
                <Button onClick={toggleMic} variant="outline">{isMicOn ? 'Mute' : 'Unmute'}</Button>
                <Button onClick={toggleCamera} variant="outline">{isCameraOn ? 'Cam Off' : 'Cam On'}</Button>
                <Button onClick={toggleScreenShare} variant="outline">{isSharingScreen ? 'Stop Sharing' : 'Share Screen'}</Button>
                <Button onClick={hangUp} variant="secondary">Hang Up</Button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (callState) {
            case 'idle': return renderIdle();
            case 'receiving': return renderReceiving();
            case 'calling': return renderCalling();
            case 'connected': return renderConnected();
            default: return renderIdle();
        }
    };

    return (
        <div className="p-2 flex flex-col items-center justify-center h-full">
            {renderContent()}
        </div>
    );
};

export default VideoSession;
