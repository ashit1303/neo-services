import { useEffect, useState } from "react";

import {
  getConnections,
  respondConnection
} from "../services/connection.service";

import ConnectionsChat from "./ConnectionsChat";
import ConnectionsNotification from "./ConnectionsNotifications";


export default function ConnectionsList() {

  const [connections, setConnections] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);


  const user =
    JSON.parse(localStorage.getItem("user") || "{}");



  const loadConnections = async () => {

    try {

      const res: any = await getConnections();

      setConnections(
        res?.data?.data || []
      );


    } catch (err) {

      console.log(err);

    }

  };



  useEffect(() => {

    loadConnections();

  }, []);





  const handleAction = async (
    id: string,
    action: "accept" | "reject"
  ) => {

    try {

      await respondConnection(
        id,
        action
      );

      loadConnections();


    } catch (err) {

      console.log(err);

    }

  };





  const getOtherUser = (item: any) => {

    const senderId =
      String(item.senderId?._id || item.senderId);


    if (senderId === String(user?._id)) {

      return item.receiverId;

    }


    return item.senderId;

  };





  return (

    <div

      className="
h-[calc(100vh-70px)]
grid
grid-cols-[350px_1fr_360px]
gap-5
p-4
bg-[#f6f7fb]
overflow-hidden
"

    >



      {/* LEFT CONNECTION */}


      <div className="bg-white rounded-2xl border border-gray-400 overflow-hidden flex flex-col">

        <div className="h-[65px] px-4 flex items-center justify-between border-b border-gray-400">

          <h1 className="font-semibold text-[22px] text-gray-800">
            Connections
          </h1>

          <button className="bg-violet-900 text-white px-4 py-2 rounded-xl text-[16px]">
            + Send Connection
          </button>
        </div>

        <div className="p-4 overflow-y-auto">

          <h3 className="font-semibold mb-4">
            Connection Requests
            <span
              className="ml-2 bg-violet-900 text-white px-1 rounded-full">
              {connections.filter(x => x.status === "pending").length}
            </span>
          </h3>

          {connections.filter(x => x.status === "pending").map(item => (
            <div key={item._id}
              className="border rounded-xl p-3 mb-3">

              <div className="flex gap-3">
                <img src={item.senderId?.profileImage || "/default.png"}
                  className="w-10 h-10 rounded-full object-cover" />
                <div>

                  <p className="font-semibold">
                    {item.senderId?.fullName}
                  </p>

                  <p className="text-xs text-gray-500">
                    Software Engineer
                  </p>

                </div>
              </div>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => handleAction(item._id, "accept")}
                  className="bg-violet-600 text-white px-5 py-2 rounded-lg">
                  Accept
                </button>

                <button onClick={() => handleAction(item._id, "reject")}
                  className="border px-5 py-2 rounded-lg">
                  Reject
                </button>
              </div>
            </div>


          ))

          }








          <h3 className="
font-semibold
mt-6
mb-3
">

            My Connections

          </h3>






          {

            connections
              .filter(
                x => x.status === "accepted"
              )
              .map(item => {


                const other =
                  getOtherUser(item);



                return (

                  <div

                    key={item._id}

                    onClick={() =>
                      setActive(item)
                    }

                    className="
flex
items-center
justify-between
p-3
rounded-xl
hover:bg-gray-50
cursor-pointer
mb-2
"

                  >



                    <div className="
flex
gap-3
items-center
">


                      <img

                        src={
                          other?.profileImage ||
                          "/default.png"
                        }

                        className="
w-11
h-11
rounded-full
object-cover
"

                      />



                      <div>


                        <p className="
font-semibold
text-sm
">

                          {
                            other?.fullName
                          }

                        </p>



                        <p className="
text-xs
text-gray-500
">

                          Software Engineer

                        </p>



                        <p className="
text-xs
text-green-500
mt-1
">

                          ● Online

                        </p>



                      </div>


                    </div>





                    <div className="
text-violet-600
text-xl
">

                      💬

                    </div>



                  </div>


                )


              })

          }



        </div>


      </div>

      {/* CHAT */}

      <div className="bg-white rounded-2xl border border-gray-400 overflow-hidden">

        <ConnectionsChat active={active} />

      </div>

      {/* NOTIFICATION */}

      <div className="rounded-2xl border border-gray-400 overflow-hidden">
        <ConnectionsNotification />
      </div>

    </div>


  )

}