import {
Menu,
Sun,
Bell,
Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps{
 sidebarOpen:boolean;
 setSidebarOpen:(value:boolean)=>void;
}

export default function Header({
 sidebarOpen,
 setSidebarOpen
}:HeaderProps){

const [user,setUser] = useState<any>(null);
const [search,setSearch] = useState("");
const [searchActive,setSearchActive] = useState(false);

useEffect(()=>{
  const loggedUser = localStorage.getItem("user");
  if(loggedUser){
    setUser(JSON.parse(loggedUser));
  }
},[]);

return (
  <div className={`h-[70px] fixed top-0 ${sidebarOpen ? "left-[240px]" : "left-0"} right-0 bg-gray-50 border-b-gray-400 border-b flex items-center justify-between px-8 z-20 transition-all`}
  >
    <div className="flex items-center gap-5">
      <button onClick={()=>setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <Menu size={25}/> : <Menu size={25}/>}
      </button>
      
      <div className="relative">
        <div className="w-[370px] h-12 border rounded-xl flex items-center gap-3 px-4">
          <Search size={20} className="text-gray-400"/>
          <input
          value={search}
          onFocus={()=>setSearchActive(true)}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search people, skills or keywords..."
          className="w-full outline-none"
          />
        </div>
        {
        searchActive && (
        <div className="absolute top-14 left-0 w-[370px] bg-white bordercrounded-xl shadow-lg p-4">
          {search ? (
            <div>
              <p className="font-semibold">
                Search Result
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Searching for: {search}
              </p>
            </div>
          ) :
          
        <div>
          <p className="text-gray-400 text-sm">
            Start typing...
          </p>
        </div>
        }
      </div>
    )
  }
  </div>
  </div>

{/* RIGHT */}

  <div className="flex items-center gap-7">
    <button
    className="hover:bg-gray-100 p-2 rounded-lg"
    onClick={()=>console.log("theme click")}
    >
      <Sun size={22}/>
    </button>
    
    <button
    className="relative hover:bg-gray-100 p-2 rounded-lg"
    onClick={()=>window.location.href="/notifications"}
    >
      <Bell size={22}/>
      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">4</span>
    </button>
    
    {/* User */}
    
    <div className="relative">
      <button className="flex items-center gap-4">
        <img 
        src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || "User"}`} 
        className="w-10 h-10 rounded-full"/>
        <div className="text-left">
          <p className="font-semibold text-md">
            {user?.name || "User"}
          </p>
          <p className="text-sm text-gray-500">
            {user?.role || "HR Manager"}
          </p>
        </div>
      </button>
    </div>
    </div>
  </div>

)

}