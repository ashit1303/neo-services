import api from "../api/api";



// get all connections

export const getConnections = async () => {

  return await api.get(
    "/connections/list"
  );

};




// accept reject

export const respondConnection = async (
  id: string,
  action: "accept" | "reject"
) => {


  return await api.post(

    `/connections/respond/${id}`,

    {
      action
    }

  );

};





// create connection

export const createConnection = async (
  receiverId: string,
  message: string
) => {


  return await api.post(

    "/connections/connect",

    {
      receiverId,
      message
    }

  );

};







// chat history

export const getChatHistory = async (
  connectionId: string
) => {


  return await api.get(

    `/connections/chat/history/${connectionId}`

  );

};








// send message

export const sendMessage = async (
  connectionId: string,
  message: string
) => {


  return await api.post(

    "/connections/chat/send",

    {
      connectionId,
      message
    }

  );

};







// notifications

export const getNotifications = async () => {


  return await api.get(

    "/connections/notifications"

  );

};






export const readNotification = async (
  id: string
) => {


  return await api.post(

    `/connections/notifications/read/${id}`

  );

};