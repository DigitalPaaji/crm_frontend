import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from "lucide-react";
import { io_url } from "./utlis";

const Videochatroom = ({ roomid, name }) => {
  const navigate = useNavigate();

  // State for all connected peers
  const [peers, setPeers] = useState([]);
  const [localMediaState, setLocalMediaState] = useState({
    isVideoOff: false,
    isAudioMuted: false,
    hasPermissions: true,
  });

  // Refs
  const socketRef = useRef();
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // Stores actual RTCPeerConnection objects mapped by socket.id

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  useEffect(() => {
    socketRef.current = io(io_url);

    const initializeMediaAndSocket = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Media permission denied or not available.", error);
        setLocalMediaState((prev) => ({ ...prev, hasPermissions: false, isVideoOff: true, isAudioMuted: true }));
        // Continue without local stream so they can still watch others
      }

      // Join room after getting media (or failing to)
      socketRef.current.emit("join-room", { roomId: roomid, name });

      // --- Socket Events ---
      
      // 1. Receive existing users when you join
      socketRef.current.on("existing-users", (existingUsers) => {
        existingUsers.forEach((user) => {
          const peer = createPeerConnection(user.id, user.name, true);
          peersRef.current[user.id] = peer;
        });
      });

      // 2. A new user joined, wait for them to send an offer
      socketRef.current.on("user-joined", (payload) => {
        const peer = createPeerConnection(payload.callerId, payload.name, false);
        peersRef.current[payload.callerId] = peer;
      });

      // 3. Receive Offer
      socketRef.current.on("offer", async (payload) => {
        const peer = peersRef.current[payload.callerId];
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socketRef.current.emit("answer", {
            target: payload.callerId,
            callerId: socketRef.current.id,
            answer,
          });
        }
      });

      // 4. Receive Answer
      socketRef.current.on("answer", async (payload) => {
        const peer = peersRef.current[payload.callerId];
        if (peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
        }
      });

      // 5. Receive ICE Candidate
      socketRef.current.on("ice-candidate", async (payload) => {
        const peer = peersRef.current[payload.callerId];
        if (peer) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error("Error adding ICE candidate", e);
          }
        }
      });

      // 6. Handle peer media state change (someone muted/turned off camera)
      socketRef.current.on("peer-media-state-change", (payload) => {
        setPeers((prevPeers) =>
          prevPeers.map((p) =>
            p.id === payload.id
              ? { ...p, isVideoOff: payload.isVideoOff, isAudioMuted: payload.isAudioMuted }
              : p
          )
        );
      });

      // 7. User Disconnected
      socketRef.current.on("user-disconnected", (id) => {
        if (peersRef.current[id]) {
          peersRef.current[id].close();
          delete peersRef.current[id];
        }
        setPeers((prevPeers) => prevPeers.filter((p) => p.id !== id));
      });
    };

    initializeMediaAndSocket();

    return () => {
      socketRef.current.disconnect();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      Object.values(peersRef.current).forEach((peer) => peer.close());
    };
  }, [roomid, name]);

  const createPeerConnection = (targetSocketId, targetName, isInitiator) => {
    const peer = new RTCPeerConnection(iceServers);

    // Add local tracks if we have permissions
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote tracks
    peer.ontrack = (event) => {
      setPeers((prevPeers) => {
        const existingPeer = prevPeers.find((p) => p.id === targetSocketId);
        if (existingPeer) return prevPeers; // Avoid duplicates

        return [
          ...prevPeers,
          {
            id: targetSocketId,
            name: targetName,
            stream: event.streams[0],
            isVideoOff: false,
            isAudioMuted: false,
          },
        ];
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          target: targetSocketId,
          callerId: socketRef.current.id,
          candidate: event.candidate,
        });
      }
    };

    if (isInitiator) {
      peer.onnegotiationneeded = async () => {
        try {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socketRef.current.emit("offer", {
            target: targetSocketId,
            callerId: socketRef.current.id,
            offer,
          });
        } catch (err) {
          console.error("Negotiation error:", err);
        }
      };
    }

    return peer;
  };

  // --- Controls ---

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuteState = !audioTrack.enabled;
        setLocalMediaState((prev) => ({ ...prev, isAudioMuted: newMuteState }));
        
        socketRef.current.emit("media-state-change", {
          roomId: roomid,
          isVideoOff: localMediaState.isVideoOff,
          isAudioMuted: newMuteState,
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoState = !videoTrack.enabled;
        setLocalMediaState((prev) => ({ ...prev, isVideoOff: newVideoState }));
        
        socketRef.current.emit("media-state-change", {
          roomId: roomid,
          isVideoOff: newVideoState,
          isAudioMuted: localMediaState.isAudioMuted,
        });
      }
    }
  };

  const leaveMeeting = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    Object.values(peersRef.current).forEach((peer) => peer.close());
    socketRef.current.disconnect();
    navigate("/dashboard");
  };

  // Responsive Grid Logic
  const totalParticipants = peers.length + 1;
  const getGridClasses = (total) => {
    if (total === 1) return 'grid-cols-1';
    if (total === 2) return 'grid-cols-1 md:grid-cols-2'; // Stack vertically on mobile
    if (total === 3 || total === 4) return 'grid-cols-2'; // 2x2 grid
    if (total >= 5 && total <= 6) return 'grid-cols-2 md:grid-cols-3'; // 3x2 grid
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; // Fallback for large meetings
  };

  return (
    <div className="relative h-[100dvh] w-full bg-gray-950 p-2 md:p-4 pt-4 md:pt-10 pb-28 md:pb-32 flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Dynamic Grid for All Users */}
      <div className={`w-full h-full max-w-7xl mx-auto grid gap-2 md:gap-4 auto-rows-fr ${getGridClasses(totalParticipants)}`}>
        
        {/* Local User */}
        <div className="group relative w-full h-full bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-gray-800 transition-all duration-300 hover:border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${localMediaState.isVideoOff ? "opacity-0 hidden" : "opacity-100 block"}`}
          />
          
          {/*  */}
          {localMediaState.isVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/95 backdrop-blur-sm">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-inner">
                <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-200 truncate px-4 max-w-full">
                {name} (You)
              </h2>
              {!localMediaState.hasPermissions && (
                <p className="text-xs md:text-sm text-red-400 mt-2 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                  Camera/Mic access denied
                </p>
              )}
            </div>
          )}
          
          {/* Name Tag */}
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs md:text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors group-hover:bg-black/70 shadow-sm z-10">
            <span className="truncate max-w-[120px] md:max-w-[200px]">{name} (You)</span>
            {localMediaState.isAudioMuted && (
              <div className="bg-red-500/20 p-1 rounded-full flex items-center justify-center">
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              </div>
            )}
          </div>
        </div>

        {/* Remote Users */}
        {peers.map((peer) => (
          <RemoteVideo key={peer.id} peer={peer} />
        ))}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 bg-gray-900/80 backdrop-blur-lg px-6 md:px-8 py-3 md:py-4 rounded-full border border-gray-700 shadow-2xl z-20">
        
        <button
          onClick={toggleAudio}
          disabled={!localMediaState.hasPermissions}
          className={`p-3 md:p-4 rounded-full transition-all disabled:opacity-50 ${
            localMediaState.isAudioMuted
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          {localMediaState.isAudioMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          disabled={!localMediaState.hasPermissions}
          className={`p-3 md:p-4 rounded-full transition-all disabled:opacity-50 ${
            localMediaState.isVideoOff
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              : "bg-gray-700 hover:bg-gray-600 text-gray-100"
          }`}
        >
          {localMediaState.isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <div className="w-px h-8 bg-gray-700 mx-1 md:mx-2"></div> {/* Separator */}

        <button
          onClick={leaveMeeting}
          className="p-3 md:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};

// Sub-component for rendering remote videos cleanly
const RemoteVideo = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && peer.stream) {
      ref.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="group relative w-full h-full bg-gray-900 rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-gray-800 transition-all duration-300 hover:border-gray-600">
      <video
        ref={ref}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${peer.isVideoOff ? "opacity-0 hidden" : "opacity-100 block"}`}
      />
      
      {/* Video Off Placeholder */}
      {peer.isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/95 backdrop-blur-sm">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-700 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-200 truncate px-4 max-w-full">
            {peer.name}
          </h2>
        </div>
      )}

      {/* Name Tag */}
      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs md:text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors group-hover:bg-black/70 shadow-sm z-10">
        <span className="truncate max-w-[120px] md:max-w-[200px]">{peer.name}</span>
        {peer.isAudioMuted && (
          <div className="bg-red-500/20 p-1 rounded-full flex items-center justify-center">
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Videochatroom;