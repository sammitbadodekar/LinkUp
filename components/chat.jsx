import { BsLink45Deg } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { AiOutlineSend } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import scrollToBottom from "./scrollToBottom";
import Image from "next/image";
import Loading from "../components/loading";
import toast from "react-hot-toast";
import { useState, useEffect, useRef, useContext } from "react";
import { IoIosPeople } from "react-icons/io";
import { UserContext } from "@/context/userContext";

const Chat = (props) => {
  const { socket, user } = props;
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState([]);
  const [input, setInput] = useState("");
  const [previousChat, setPreviousChat] = useState(null);
  const chatMessagesRef = useRef(null);
  const { active, setActive } = useContext(UserContext);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    if (previousChat?.email === active?.email || !active) {
      scrollToBottom(chatMessagesRef, 300);
    } else {
      setMessages([]);
      fetch(
        `/api/messages/${
          active.name === "Chat Lounge"
            ? active.name
            : `${user.email}-${active.email}`
        }`
      )
        .then((resp) => resp.json())
        .then((data) => {
          if (data) {
            setRoomName(data?.roomName);
            setMessages(data?.messages);
          }
        })
        .then(() => scrollToBottom(chatMessagesRef, 400));
    }
  }, [active]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input !== "") {
      fetch("/api/sendMessage", {
        method: "PUT",
        body: JSON.stringify({
          roomName,
          messages: [
            ...messages,
            {
              message: input,
              sender: {
                name: user.name,
                image: user.image,
                email: user.email,
              },
            },
          ],
        }),
      });
      console.log([
        ...messages,
        {
          message: input,
          sender: {
            name: user.name,
            image: user.image,
            email: user.email,
          },
        },
      ]);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: input,
          sender: { name: user.name, image: user.image, email: user.email },
        },
      ]);
      setInput("");
      socket.emit("send_message", {
        message: input,
        sender: { name: user.name, image: user.image, email: user.email },
        to: active?.email,
      });
      scrollToBottom(chatMessagesRef, 200);
    }
  };
  useEffect(() => {
    socket.on("broadcast", (data) => {
      if (activeRef.current?.name === "Chat Lounge") {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom(chatMessagesRef, 200);
      }
    });
    socket.on("receive_message", (data) => {
      if (activeRef.current?.email === data.sender?.email) {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom(chatMessagesRef, 200);
      }
      if (activeRef.current?.email !== data.sender?.email) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
          >
            <div
              className="w-0 flex-1 p-4"
              onClick={() => {
                setActive(data.sender);
                setMessages([]);
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Image
                    src={data.sender?.image}
                    alt="/PngItem_307416.png"
                    width={50}
                    height={50}
                    className=" rounded-full"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {data.sender?.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {data.message.slice(0, 15)}...
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ));
      }
    });
  }, [socket]);
  if (!active) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 border-l-2 border-slate-300 bg-slate-100 opacity-0 dark:border-slate-600  dark:bg-darkTheme sm:opacity-100">
        <div className=" rounded-full bg-slate-300 p-4 text-9xl shadow-xl dark:bg-DarkButNotBlack">
          <BsLink45Deg />
        </div>
        <p className=" mx-4 dark:text-white ">
          Connect, Chat, and Collaborate in Real Time with{" "}
          <span className=" text-xl font-extrabold">LinkUp!</span>
        </p>
      </div>
    );
  }
  return (
    <div className=" h-full w-full border-l-2 border-slate-300 dark:border-slate-600">
      <div className="sticky top-0 flex items-center gap-2 bg-slate-100  p-2 py-2 shadow-lg dark:bg-DarkButNotBlack dark:text-white">
        <div
          className=" text-lg sm:hidden"
          onClick={() => {
            setPreviousChat(active);
            setActive(null);
          }}
        >
          <BiArrowBack />
        </div>
        <Image
          src={active?.image || "/PngItem_307416.png"}
          alt=""
          width={50}
          height={50}
          className={`self-start rounded-full ${
            active?.name === "Chat Lounge" ? "hidden" : ""
          }`}
        ></Image>
        <span
          className={`-mr-2 rounded-full bg-slate-300 p-2 text-2xl text-darkTheme ${
            active?.name !== "Chat Lounge" ? "hidden" : ""
          }`}
        >
          <IoIosPeople />
        </span>
        <p className=" p-2">{active?.name}</p>
      </div>

      <div className="chat-messages flex w-screen flex-col  overflow-x-hidden overflow-y-scroll bg-white text-left dark:bg-darkTheme">
        {/*  <div
          className={`${
            messages?.length == 0
              ? "mt-10 flex h-screen justify-center"
              : "hidden"
          } `}
        >
          <Loading />
        </div> */}

        {messages
          ? messages.map((message) => {
              if (message.sender?.email === user?.email) {
                return (
                  <div
                    className="max-w-4/5 m-1 ml-8 mr-2 flex h-fit w-fit items-start justify-center self-end rounded-3xl rounded-tr-sm bg-blue-400 p-2 px-4 dark:bg-green-600"
                    key={uuidv4()}
                  >
                    <p>{message?.message}</p>
                  </div>
                );
              }
              return (
                <div
                  className="m-1 mx-2 flex w-fit items-start justify-center gap-2 "
                  key={uuidv4()}
                >
                  <Image
                    src={message?.sender?.image || "/PngItem_307416.png"}
                    alt=""
                    width={30}
                    height={30}
                    className={`rounded-full`}
                  ></Image>
                  <div className=" flex flex-col gap-2 rounded-3xl rounded-tl-sm bg-slate-200 p-2 px-4 dark:bg-DarkButNotBlack">
                    <p className=" -ml-2 text-xs font-extralight">
                      ~ {message?.sender?.name}
                    </p>
                    <p>{message?.message}</p>
                  </div>
                </div>
              );
            })
          : ""}
        <div ref={chatMessagesRef} />
      </div>
      <form
        className=" sticky bottom-0 flex h-14 justify-between gap-2 bg-white p-2 dark:bg-darkTheme"
        onSubmit={(e) => sendMessage(e)}
      >
        <input
          type="text"
          placeholder="Message"
          className=" w-full rounded-3xl bg-slate-300 p-2 dark:bg-slate-600"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <button
          type="submit"
          className=" flex w-12 items-center justify-center rounded-3xl bg-slate-300  dark:bg-DarkButNotBlack dark:text-white"
        >
          <AiOutlineSend />
        </button>
      </form>
    </div>
  );
};
export default Chat;
