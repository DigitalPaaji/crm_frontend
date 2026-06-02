import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { io_url } from "./utlis";

const socket = io(io_url);

const Videochatroom = ({ roomid,name }) => {
  const navigate = useNavigate();
  
  // Media references
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  // UI States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);

  useEffect(() => {
    const startConnection = async () => {
      try {
        // 1. Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize Peer Connection
        peerRef.current = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ],
        });

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        // Listen for remote tracks
        peerRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsRemoteConnected(true);
          }
        };

        // Listen for ICE candidates and send them to the server
        peerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomId: roomid,
              candidate: event.candidate,
            //   username:name
            });
          }
        };

        // 3. Join the room via signaling server
        socket.emit("join-room", roomid,name);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Could not access camera or microphone.");
      }
    };

    startConnection();

    // Socket Event Listeners
    socket.on("user-joined", async () => {
      // Create and send offer when a new user joins
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      socket.emit("offer", { roomId: roomid, offer });
    });

    socket.on("offer", async (offer) => {
      // Receive offer, set remote description, and send answer
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId: roomid, answer });
    });

    socket.on("answer", async (answer) => {
      // Receive answer and set remote description
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async (candidate) => {
      // Add incoming ICE candidates
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ice candidate:", err);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");

      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomid]);

  // --- Control Functions ---

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveMeeting = () => {
    // Stop tracks and clean up
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.close();
    socket.disconnect(); // Optional depending on if you reuse the socket
    navigate("/dashboard"); // Redirect user after leaving
  };

  return (
    <div className="relative h-screen w-full bg-gray-950 flex items-center justify-center overflow-hidden font-sans">
      
      {/* Remote Video (Main Background) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isRemoteConnected ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Video className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-lg font-medium">Waiting for others to join...</p>
            <p className="text-sm">Room: {roomid}</p>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-6 right-6 w-48 sm:w-64 aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700/50 z-10 transition-all hover:scale-105">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'} scale-x-[-1]`} // Flipped for mirror effect
        />
        {isVideoOff && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <VideoOff className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-800/50 shadow-2xl z-20">
        
        {/* Mute Button */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all ${
            isAudioMuted 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
          title={isAudioMuted ? "Unmute" : "Mute"}
        >
          {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Button */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${
            isVideoOff 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-gray-800 hover:bg-gray-700 text-gray-200"
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        {/* Leave Button */}
        <button
          onClick={leaveMeeting}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20"
          title="Leave Meeting"
        >
          <PhoneOff className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default Videochatroom;