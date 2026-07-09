import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  getNotifications,
  readNotification,
} from "../services/connection.service";

export default function ConnectionsNotification() {
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await getNotifications();

      setList(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRead = async (id: string) => {
    try {
      await readNotification(id);

      setList((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
              ...item,
              read: true,
            }
            : item,
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="h-[65px] border-b border-gray-400 px-5 flex items-center justify-between shrink-0">
        <h1 className="text-[23px] text-gray-800 font-semibold">Notifications</h1>

        <button className="text-violet-900 text-[18px]">Mark all as read</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {list.map((n: any) => (
          <div
            key={n._id}
            onClick={() => handleRead(n._id)}
            className="p-5 border-b flex gap-4 cursor-pointer hover:bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0">
              👥
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold text-[15px]">
                  {n.title || "New Message"}
                </h3>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-violet-600 mt-2"></span>
                )}
              </div>

              <p className="text-gray-600 text-sm mt-2">
                {n.message}
              </p>

              <p className="text-xs text-gray-400 mt-3">
                {n.createdAt
                  ? new Date(n.createdAt).toLocaleString()
                  : "2h ago"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="m-3 text-[18px] border border-violet-900 text-violet-900 py-3 justify-center rounded-xl inline-flex items-center gap-2 whitespace-nowrap">
        View All Notifications <ArrowRight size={22} className="mt-1"/>
      </button>
    </div>
  );
}
