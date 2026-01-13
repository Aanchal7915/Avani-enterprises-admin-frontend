// import {BrowserRouter,Routes,Route} from 'react-router-dom';
// import Home from '../pages/Home';
// export default ()=> (
// <BrowserRouter><Routes><Route path='/' element={<Home/>}/></Routes></BrowserRouter>)




import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ContactedLeads from "../pages/ContactedLeads";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";
import SeoManager from "../pages/SeoManager";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* All Leads / Main Dashboard */}
      <Route path="/" element={<Home />} />

      {/* Sirf contacted leads */}
      <Route path="/contacted-leads" element={<ContactedLeads />} />

      {/* Analytics dashboard */}
      <Route path="/analytics" element={<AnalyticsDashboard />} />
  <Route path="/seo" element={<SeoManager />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
