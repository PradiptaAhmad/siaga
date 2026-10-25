import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayouts";
import AdminDashboard from "../pages/AdminDashboard";


export default function AdminRoutes(){
    return(
        <>
        <Routes>
            <Route element={<AdminLayout/>}>
                <Route path="/dashboard" element={<AdminDashboard />} />
            </Route>
        </Routes>
        </>
    )
}