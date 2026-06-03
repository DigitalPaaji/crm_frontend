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

  return (
    <div className="relative h-screen w-full bg-gray-950 p-4 pt-10 pb-32 flex flex-wrap gap-4 items-center justify-center overflow-hidden font-sans">
      
      {/* Dynamic Grid for All Remote Users */}
      <div className={`w-full h-full grid gap-4 ${peers.length === 0 ? 'grid-cols-1' : peers.length === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        
        {/* Local User */}
        <div className="relative w-full h-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover scale-x-[-1] ${localMediaState.isVideoOff ? "hidden" : "block"}`}
          />
          {localMediaState.isVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-300">{name} (You)</h2>
              {!localMediaState.hasPermissions && (
                <p className="text-sm text-red-400 mt-2">Camera/Mic access denied</p>
              )}
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-white text-sm">
            {name} (You) {localMediaState.isAudioMuted && <MicOff className="inline w-4 h-4 ml-2 text-red-500" />}
          </div>
        </div>

        {/* Remote Users */}
        {peers.map((peer) => (
          <RemoteVideo key={peer.id} peer={peer} />
        ))}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-800 shadow-2xl z-20">
       
        <button
          onClick={toggleAudio}
          disabled={!localMediaState.hasPermissions}
          className={`p-4 rounded-full transition-all disabled:opacity-50 ${
            localMediaState.isAudioMuted
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
        >
          {localMediaState.isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          disabled={!localMediaState.hasPermissions}
          className={`p-4 rounded-full transition-all disabled:opacity-50 ${
            localMediaState.isVideoOff
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
        >
          {localMediaState.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={leaveMeeting}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20"
        >
          <PhoneOff className="w-6 h-6" />
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
    <div className="relative w-full h-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 flex items-center justify-center">
      <video
        ref={ref}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${peer.isVideoOff ? "hidden" : "block"}`}
      />
      {peer.isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-300">{peer.name}</h2>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-white text-sm">
        {peer.name} {peer.isAudioMuted && <MicOff className="inline w-4 h-4 ml-2 text-red-500" />}
      </div>
    </div>
  );
};

export default Videochatroom;