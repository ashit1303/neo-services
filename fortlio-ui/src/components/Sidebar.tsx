import { NavLink } from "react-router-dom";
import {
  Home,
  User,
  Search,
  Users,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle
} from "lucide-react";
import { useEffect, useState } from "react";

const menu = [
  {name:"Dashboard", path:"/", icon:Home},
  {name:"HR Profile", path:"/profile", icon:User},
  {name:"Search Candidates", path:"/search", icon:Search},
  {name:"Connections", path:"/connection", icon:Users},
  {name:"Messages", path:"/chat", icon:MessageCircle},
  {name:"Notifications", path:"/notifications", icon:Bell},
];

export default function Sidebar(){
  const [user,setUser] = useState<any>(null);
  
  useEffect(()=>{
    const loggedUser = localStorage.getItem("user");
    if(loggedUser){
      setUser(JSON.parse(loggedUser));
    }
  },[]);

return (

<div className="w-[240px] h-screen bg-[#07142f] text-white flex flex-col fixed left-0 top-0">
  <div className="p-6">
    <h1 className="text-2xl font-bold">
      Neo Services
    </h1>
</div>

<div className="flex-1 px-4 space-y-2">
  {menu.map((item)=>{const Icon = item.icon;

return (

<NavLink 
  key={item.name}
  to={item.path}
  className={({isActive})=>`flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "hover:bg-white/10"}`}
>
  <Icon size={22}/>
  <span>{item.name}</span>

</NavLink>

)
})
}

<div className="mt-5 space-y-2">

<hr className="border-white/20"/>

<NavLink to="/settings"
  className={({isActive})=>`flex items-center gap-4 px-4 py-3 rounded-xl ${isActive ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "hover:bg-white/10"}`}
>
  <Settings size={22}/>
  <span>Settings</span>
</NavLink>

<NavLink to="/help"
  className={({isActive})=>`flex items-center gap-4 px-4 py-3 rounded-xl ${isActive ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "hover:bg-white/10"}`}
>
  <HelpCircle size={22}/>
  <span>Help & Support</span>

</NavLink>

</div>
</div>

<div className="mx-6 mb-4">

<div className="flex items-center gap-4">
  <img src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || "User"}`}
    className="w-10 h-10 rounded-full"
  />
<div>
  
  <p className="text-md font-semibold">
    {user?.name || "User"}
  </p>
  
  <p className="text-sm text-gray-400">
    {user?.role || "HR Manager"}
  </p>

</div>
</div>
</div>
</div>

)

}