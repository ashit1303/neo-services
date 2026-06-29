import { useEffect, useState } from "react";
import { Paperclip, ChevronRight } from "lucide-react";

import {
  getChatHistory,
  sendMessage
} from "../services/connection.service";


export default function ConnectionsChat({ active }: any) {


  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");


  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  const userId = user?._id;



  // other user find

  const otherUser =
    active?.senderId?._id === userId ||
      active?.senderId === userId
      ?
      active?.receiverId
      :
      active?.senderId;





  const loadChat = async () => {


    if (!active) return;


    try {


      const res: any =
        await getChatHistory(
          active._id
        );



      setMessages(
        res?.data?.data || []
      );



    } catch (err) {

      console.log(err);

    }


  };






  useEffect(() => {

    loadChat();

  }, [active]);







  const send = async () => {


    if (!text.trim() || !active)
      return;



    try {


      const res: any =
        await sendMessage(
          active._id,
          text
        );



      const newMsg =
        res?.data?.data ||
        {
          message: text,
          senderId: userId,
          createdAt: new Date()
        };



      setMessages(prev => [
        ...prev,
        newMsg
      ]);



      setText("");



    } catch (err) {

      console.log(err);

    }



  };






  return (

    <div className="h-full flex flex-col overflow-hidden">




      {/* HEADER */}


      <div
        className="h-[65px] border-b border-gray-400 flex items-center justify-between px-5 shrink-0">


        <div className="flex items-center gap-4">

          <img src={otherUser?.profileImage || "/default.png"}
            className="w-10 h-10 rounded-full object-cover" />

          <div>

            <h2 className="font-semibold text-[20px]">
              {otherUser?.fullName || "Name"}
            </h2>
            {/* 
<p className="text-green-500 text-sm">

● Online

</p> */}
          </div>
        </div>
      </div>

      <div className="text-center py-3 text-gray-600">
        Today
      </div>

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto px-8 space-y-2">
        {messages.map((m: any, i) => (
          <div key={i}
            className={`flex ${String(m.senderId?._id || m.senderId) === String(userId) ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[65%] px-5 py-3 rounded-2xl ${String(m.senderId?._id || m.senderId) === String(userId) ?
              "bg-violet-600 text-white rounded-br-none" : "bg-gray-100 rounded-bl-none"}`}
            >

              <p>{m.message}</p>

              <p className="text-xs mt-2 opacity-70">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>

            </div>

          </div>

        ))

        }

      </div>


      {/* INPUT */}

      <div className="h-[65px] border-t border-gray-400 flex items-center gap-3 px-3 shrink-0">

        <button className="text-gray-500">
          <Paperclip size={22} />
        </button>

        <div className="flex-1 h-[45px] border border-gray-500 rounded-xl flex items-center px-4">

          <input value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 outline-none" />
        </div>

        <button
          onClick={send}
          className="w-[45px] h-[45px] rounded-xl bg-violet-600 text-white justify-center items-center inline-flex"><ChevronRight size={26} />
        </button>
      </div>

    </div>

  )

}