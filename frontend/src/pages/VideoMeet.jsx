// React hooks for lifecycle (useEffect), referencing DOM (useRef), and managing state (useState).
import { useEffect, useRef, useState } from "react";

import Button from "@mui/material/Button"; // Material UI button
import IconButton from "@mui/material/IconButton"; // Material UI icon button
import Badge from "@mui/material/Badge"; // Material UI badge for notifications
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa"; // Video/audio icons
import {
  MdCallEnd,
  MdScreenShare,
  MdStopScreenShare,
  MdChat,
} from "react-icons/md"; // Call/screen/chat icons

import { io } from "socket.io-client"; // For real-time communication
import { IoMdSend } from "react-icons/io"; // Send icon
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Auth context for user info
import { useNavigate } from "react-router-dom"; // For navigation

import server from "../environment"; // Server URLs

const server_url = server.prod; // Use production server URL

let connections = {}; // Store all peer connections

const peerConfigConnections = {
  // ICE servers help peers discover each other and traverse NAT/firewalls.
  iceServers: [{ urls: "stun:stun.l.google.com:19320" }], // ICE server config for WebRTC
};

const VideoMeet = () => {
  const { loggedInUser } = useContext(AuthContext); // Get logged-in user from context
  const navigate = useNavigate(); // Navigation hook

  let socketRef = useRef(); // socket.io client
  let socketIdRef = useRef(); // current user's socket ID
  let localVideoRef = useRef(); // ref to local <video> element
  let videoRef = useRef(); // dynamic ref for remote streams

  // State variables for video/audio/screen/chat/etc.
  let [videoAvailable, setVideoAvailable] = useState(true); // Is camera available
  let [audioAvailable, setAudioAvailable] = useState(true); // Is mic available
  let [video, setVideo] = useState(false); // Video state (on/off)
  let [audio, setAudio] = useState(false); // Audio state (on/off)
  let [screen, setScreen] = useState(false); // Screen sharing state
  let [showModal, setModal] = useState(false); // Show/hide chat modal
  let [screenAvailable, setScreenAvailable] = useState(true); // Is screen sharing available
  let [messages, setMessages] = useState([]); // Chat messages
  let [message, setMessage] = useState(""); // Current chat input
  let [newMessages, setNewMessages] = useState(0); // Unread chat count
  let [askForUsername, setAskForUsername] = useState(true); // Show lobby before joining
  let [videos, setVideos] = useState([]); // Array of remote video streams

  // Check for permissions and set up local stream
  async function getPermissions() {
    try {
      // Request camera permission
      let videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoPermission ? setVideoAvailable(true) : setVideoAvailable(false);

      // Request mic permission
      let audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioPermission ? setAudioAvailable(true) : setAudioAvailable(false);

      // Check if screen sharing is available
      navigator.mediaDevices.getDisplayMedia
        ? setScreenAvailable(true)
        : setScreenAvailable(false);

      // If video or audio is available, get user media
      if (videoAvailable || audioAvailable) {
        let userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream; // Save stream globally
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream; // Show local video
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Run getPermissions on mount
  useEffect(() => {
    getPermissions();
  }, []);

  // Success callback for getUserMedia
  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    // Add stream to all peer connections and create offers
    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    // Handle track end (e.g., user disables camera/mic)
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  // Helper to create a silent audio track
  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // Helper to create a black video track
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // Get user media (camera/mic) and update stream
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  // When video/audio state changes, update user media
  useEffect(() => {
    if (video != undefined && audio != undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  // Handle incoming signaling messages from server
  let gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  // Add a chat message to the state
  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  // Connect to the socket server and set up event listeners
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((video) => video.socketId != id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);
            setVideos((prevVideos) => {
              const exists = prevVideos.some(
                (v) => v.socketId === socketListId
              );

              const updated = exists
                ? prevVideos.map((v) =>
                    v.socketId === socketListId
                      ? { ...v, stream: event.stream }
                      : v
                  )
                : [
                    ...prevVideos,
                    {
                      socketId: socketListId,
                      stream: event.stream,
                      autoPlay: true,
                      playsinline: true,
                    },
                  ];

              videoRef.current = updated;
              return updated;
            });
          };
          if (window.localStream != undefined && window.localStream != null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  // Get media and connect to socket server
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // Toggle video on/off
  let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
  };
  // Toggle audio on/off
  let handleAudio = () => {
    setAudio(!audio);
    // getUserMedia();
  };

  // Success callback for screen sharing
  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  // Get display (screen share) media
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => {
            setScreen(!screen);
            console.log(e);
          });
      }
    }
  };

  // When screen state changes, update display media
  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  // Toggle screen sharing
  let handleScreen = () => {
    setScreen(!screen);
  };

  // End call: stop all tracks and redirect to home
  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  // Send a chat message
  let sendMessage = () => {
    socketRef.current.emit(
      "chat-message",
      message,
      loggedInUser || "Anonymous"
    );
    setMessage("");
  };

  // Connect to meeting: hide username prompt, get media, connect to socket
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  // Cleanup on unmount or navigation
  useEffect(() => {
    return () => {
      // Stop all local media tracks
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          localVideoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
          localVideoRef.current.srcObject = null; // Release the stream
        }
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop());
          window.localStream = null;
        }
      } catch (e) {}

      // Close all peer connections
      Object.values(connections).forEach((conn) => {
        try {
          conn.close();
        } catch (e) {}
      });

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Render UI
  return (
    <>
      {askForUsername ? (
        // Lobby: show video preview and connect button
        <div className="bg-white h-screen p-5">
          <h1 className="text-3xl text-blue-900 font-bold text-center mt-2 mb-8">
            Enter the Lobby
          </h1>

          <div className="py-3">
            <video
              autoPlay
              muted
              ref={localVideoRef}
              className="w-xs sm:w-sm shadow-md"
            ></video>
          </div>
          <div className="my-2 w-sm max-sm:w-xs cursor-pointer">
            <Button variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Main meeting UI */}
          <div className="bg-white flex flex-1 overflow-auto">
            {/* Chat modal */}
            {showModal ? (
              <div className="bg-gray-100 fixed top-0 right-0 bottom-0 flex flex-col max-sm:w-screen border border-l-gray-300">
                <div className="bg-blue-500 p-4 text-white text-center">
                  <span>Chat Room</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col space-y-2">
                    {messages.length > 0 ? (
                      messages.map((item, index) =>
                        (loggedInUser || "Anonymous") == item.sender ? (
                          <div key={index} className="flex justify-end">
                            <div className="flex flex-col">
                              <p className="font-semibold text-sm text-right">
                                {item.sender}
                              </p>
                              <div className=" bg-blue-200 text-black p-2 rounded-lg max-w-sm max-sm:max-w-xs break-words whitespace-pre-wrap">
                                {item.data}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={index} className="flex">
                            <div className="flex flex-col">
                              <p className="font-semibold text-sm text-left">
                                {item.sender}
                              </p>
                              <div className="bg-gray-300 text-black p-2 rounded-lg max-w-sm max-sm:max-w-xs break-words whitespace-pre-wrap">
                                {item.data}
                              </div>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="font-semibold text-center">
                        No Messages yet !
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 flex items-center">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 rounded-full p-2 ml-2 hover:bg-blue-600 focus:outline-none hover:cursor-pointer"
                  >
                    <IoMdSend color="white" />
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* Video grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 p-2">
              {/* Local video */}
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="rounded-2xl border-2 border-blue-500"
              ></video>
              {/* Remote videos */}
              {videos.map((video) => (
                <video
                  className="max-sm:h-52"
                  key={video.socketId}
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              ))}
            </div>

            {/* Bottom controls */}
            <div className="bg-blue-950 text-center fixed bottom-0 left-0 right-0">
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <MdCallEnd />
              </IconButton>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video === true ? <FaVideo /> : <FaVideoSlash />}
              </IconButton>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio === true ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </IconButton>

              {screenAvailable === true ? (
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen === true ? <MdStopScreenShare /> : <MdScreenShare />}
                </IconButton>
              ) : (
                <></>
              )}

              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton
                  onClick={() => setModal(!showModal)}
                  style={{ color: "white" }}
                >
                  <MdChat />
                </IconButton>
              </Badge>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default VideoMeet;
