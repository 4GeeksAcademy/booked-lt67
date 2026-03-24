// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Lector from "./pages/Lector";
import NuevoLector from "./pages/NuevoLector";
import VerLector from "./pages/VerLector";
import EditarLector from "./pages/EditarLector";
import Editorial from "./pages/2_Editorial";
import NuevaEditorial from "./pages/2_NuevaEditorial";
import VerEditorial from "./pages/2_VerEditorial";
import EditarEditorial from "./pages/2_EditarEditorial";
import Autor from "./pages/3_Autor";
import VerAutor from "./pages/3_VerAutor";
import NuevoAutor from "./pages/3_NuevoAutor";
import EditarAutor from "./pages/3_EditarAutor";
import LectorAutoresFavoritos from "./pages/5_LectorAutoresFavoritos";

export const router = createBrowserRouter(
    createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
        <Route path="/demo" element={<Demo />} />
        <Route path="/lector" element={<Lector />} />
        <Route path="/nuevo_lector" element={<NuevoLector />} />
        <Route path="/ver_lector/:theId" element={<VerLector />} />
        <Route path="/editar_lector/:theId" element={<EditarLector />} />

        <Route path="/editorial" element={<Editorial />} />
        <Route path="/nueva_editorial" element={<NuevaEditorial />} />
        <Route path="/ver_editorial/:theId" element={<VerEditorial />} />
        <Route path="/editar_editorial/:theId" element={<EditarEditorial />} />

        <Route path="/autor" element={<Autor />} />
        <Route path="/nuevo_autor" element={<NuevoAutor />} />
        <Route path="/ver_autor/:theId" element={<VerAutor />} />
        <Route path="/editar_autor/:theId" element={<EditarAutor />} />

        <Route path="/lector_autores_favoritos" element={<LectorAutoresFavoritos />} />


      </Route>
    )
);