import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);

        const token = params.get("token");

        if(!token){
          setMessage("Invalid verification link");
          setLoading(false);
          return;
        }
        
        const respone = await api.get(
          `/auth/verifyEmail?token=${token}`
        );

        console.log("Verify Response:", respone.data);
        setSuccess(true);

        setMessage("Your email has been verified successfully");

        setTimeout(() => {
          navigate("/login");
        }, 2500);

      } catch (error:any) {
        console.log(error.response?.data);
        setSuccess(false);
       
        setMessage(error.response?.data?.message || "Email verification Failed");

      } finally {
        setLoading(false);
      }
    };
    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-300 to-purple-700 px-4">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center">
        {
          loading ? (
            <>
            <div className="mx-auto mb-6 h-20 w-20 rounded-full border-8 border-purple-200 border-t-purple-700 animate-spin"/>

            <h2 className="text-2xl font-bold text-gray-800">Verifing Email...</h2>

            <p className="mt-3 text-gray-500">
              Please wait while we verify your account
            </p>
            </>
          ) : (
            <> 
             <div className={`mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center text-4xl ${success ? "bg-green-100" : "bg-red-100"}`}>
              { success ? "✓" : "!"}
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              {
                success
                ? "Email Verified"
                : "Verification Failed"
              }
            </h1>

            <p className="mt-4 text-gray-600 leading-6">{message}</p>

            {
              success && (
                <p className="mt-5 text-sm text-purple-600">Redirecting to Login...</p>
              )
            }
            </>
          )
        }
      </div>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import api from "../api/api";


// export default function VerifyEmail() {

//   const location = useLocation();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");


//   useEffect(() => {

//     const verifyEmail = async () => {

//       try {

//         const params = new URLSearchParams(
//           location.search
//         );

//         const token = params.get("token");


//         if (!token) {
//           setMessage("Invalid verification link");
//           setLoading(false);
//           return;
//         }


//         const response = await api.get(
//           `/auth/verifyEmail?token=${token}`
//         );


//         console.log(
//           "Verify Response:",
//           response.data
//         );


//         setMessage(
//           "Email verified successfully 🎉"
//         );


//         setTimeout(() => {
//           navigate("/login");
//         }, 2000);


//       } catch (error:any) {


//         console.log(
//           error.response?.data
//         );


//         setMessage(
//           error.response?.data?.message ||
//           "Email verification failed"
//         );


//       } finally {

//         setLoading(false);

//       }

//     };


//     verifyEmail();


//   }, [location,navigate]);



//   return (

//     <div className="min-h-screen flex
//       items-center
//       justify-center
//       bg-gradient-to-br
//       from-purple-200
//       via-purple-300
//       to-purple-600
//     ">


//       <div className="
//         bg-white
//         p-10
//         rounded-3xl
//         shadow-xl
//         text-center
//       ">


//         {
//           loading ? (

//             <h1 className="text-xl">
//               Verifying email...
//             </h1>

//           ) : (

//             <h1 className="text-xl font-bold">
//               {message}
//             </h1>

//           )
//         }


//       </div>


//     </div>

//   );
// }