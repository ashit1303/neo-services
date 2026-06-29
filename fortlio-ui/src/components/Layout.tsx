import {useState} from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {Outlet} from "react-router-dom";


export default function Layout(){
const [sidebarOpen,setSidebarOpen] = useState(true);

return (
  <div>
    {
      sidebarOpen && <Sidebar/>
    }
    
    <Header
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
    <div className={`pt-[70px] transition-all ${sidebarOpen ? "ml-[240px]" : "ml-0"}`}>
      <Outlet/>
    </div>
  </div>

)

}