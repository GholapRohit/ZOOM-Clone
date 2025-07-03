import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { io } from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import {
  MdCallEnd,
  MdScreenShare,
  MdStopScreenShare,
  MdChat,
} from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8080";

let connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19320" }],
};

const VideoMeet = () => {
  const { loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let videoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState(false);
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState(true);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [videos, setVideos] = useState([]);

  //TODO
  // if(isChrome === false){...}

  async function getPermissions() {
    try {
      // video permission
      let videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoPermission ? setVideoAvailable(true) : setVideoAvailable(false);

      // audio permission
      let audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioPermission ? setAudioAvailable(true) : setAudioAvailable(false);

      // screen share
      navigator.mediaDevices.getDisplayMedia
        ? setScreenAvailable(true)
        : setScreenAvailable(false);

      if (videoAvailable || audioAvailable) {
        let userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
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

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

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

  useEffect(() => {
    if (video != undefined && audio != undefined) {
      getUserMedia();
    }
  }, [video, audio]);

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

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideo((videos) => videos.filter((video) => video.socketId != id));
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
            let videoExist = videos.find(
              (video) => video.socketId == socketListId
            );
            if (videoExist) {
              setVideo((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId == socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
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
                    "signal",
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

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let handleVideo = () => {
    setVideo(!video);
    // getUserMedia();
  };
  let handleAudio = () => {
    setAudio(!audio);
    // getUserMedia();
  };

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

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  let sendMessage = () => {
    // console.log(socketRef.current);
    socketRef.current.emit(
      "chat-message",
      message,
      loggedInUser || "Anonymous"
    );
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

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

  return (
    <>
      {askForUsername ? (
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
          <div className="bg-white flex flex-1 overflow-auto">
            {showModal ? (
              <div className="bg-gray-100 absolute top-0 right-0 bottom-10 flex flex-col max-sm:w-screen border border-l-gray-300">
                <div className="bg-blue-500 p-4 text-white text-center">
                  <span>Chat Room</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col space-y-2">
                    {messages.length > 0 ? (
                      messages.map((item, index) =>
                        loggedInUser || "Anonymous" == item.sender ? (
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

            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 p-2">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="rounded-2xl border-2 border-blue-500"
              ></video>
              {videos.map((video) => (
                <video
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
