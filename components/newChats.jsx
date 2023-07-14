import { useEffect, useState, useContext } from "react";
import { BiArrowBack } from "react-icons/bi";
import { UserContext } from "@/context/userContext";
import toast from "react-hot-toast";
import Image from "next/image";
import Loading from "./loading";

const NewChats = (props) => {
  const { user, setRequests, requests, friends } = useContext(UserContext);
  const { addNewChats, setAddNewChats, socket, backendURL } = props;
  const [allUsers, setAllUsers] = useState(null);

  const addFriend = (receiver) => {
    const isDuplicate = requests?.some(
      (item) => item?.receiver?.email === receiver?.email
    );
    const alreadyReceived = requests?.some(
      (item) => item?.sender?.email === receiver?.email
    );
    try {
      if (isDuplicate) toast(`Already requested ${receiver.name}`);
      else if (alreadyReceived)
        toast(`${receiver.name} has already sent you request`);
      else {
        socket.emit("send_request", {
          type: "received",
          sender: user,
          receiver,
        });
        setRequests((prev) => [{ type: "sent", receiver }, ...prev]);
        fetch("/api/sendRequest", {
          method: "PUT",
          body: JSON.stringify({
            sender: {
              name: user?.name,
              email: user?.email,
              image: user?.image,
              requests: requests,
              friends: friends,
            },
            receiver,
          }),
        }).then(toast(`Request sent to ${receiver.name}`));
      }
    } catch (error) {
      toast(`Error: request not sent`);
    }
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      const userInfo = await fetch(
        `https://linkup-backend-2uhh.onrender.com/getAllUsers`
      );
      const result = await userInfo.json();
      setAllUsers(Object.entries(result));
    };
    fetchAllUsers();
  }, []);
  if (!allUsers && addNewChats) {
    return (
      <div className=" absolute left-0 right-0 top-0 flex h-screen items-center justify-center bg-darkTheme sm:right-2/3">
        <h1
          className=" fixed left-0 right-0 top-0 z-20 flex items-center gap-4 p-4 text-xl font-bold dark:bg-DarkButNotBlack sm:right-2/3"
          onClick={() => {
            setAddNewChats(false);
          }}
        >
          <BiArrowBack />
          New Chats
        </h1>
        <Loading />
      </div>
    );
  }
  return (
    <div
      className={`newChats + fixed bottom-0 left-0 top-0 z-20 flex flex-col justify-between gap-2 overflow-y-scroll pt-20 dark:bg-darkTheme dark:text-white ${
        addNewChats ? "open" : ""
      }`}
    >
      <h1
        className=" fixed top-0 z-20 flex w-full items-center gap-4 p-4 text-xl font-bold dark:bg-DarkButNotBlack"
        onClick={() => {
          setAddNewChats(false);
        }}
      >
        <BiArrowBack />
        New Chats
      </h1>
      <div className=" mt-0 px-2">
        {allUsers?.map(([key, value]) => {
          const isFriend = friends?.some(
            (item) => item?.email === value?.email
          );
          if (
            value?.email === user?.email ||
            isFriend ||
            value?._id === "64ad009445613725d39e7d73"
          )
            return;

          return (
            <article
              key={key}
              className=" relative flex items-center gap-2 p-4"
            >
              <Image
                src={value?.image || "/PngItem_307416.png"}
                width={50}
                height={50}
                alt="profile"
                className=" rounded-full object-cover"
              />
              <p>{value?.name}</p>
              <button
                className=" absolute right-4 top-6 rounded-xl p-2 text-xs dark:bg-slate-600"
                onClick={() => addFriend(value)}
              >
                Add
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};
export default NewChats;
