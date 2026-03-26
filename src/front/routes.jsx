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
import Libro from "./pages/4_Libro";
import EditarLibro from "./pages/4_EditarLibro";
import VerLibro from "./pages/4_VerLibro";
import NuevoLibro from "./pages/4_NuevoLibro";
import LibrosFavoritos from "./pages/5_LibrosFavoritos";
import AgregarLibroFavorito from "./pages/5_AgregarLibroFavorito";
import EditarLibroFavorito from "./pages/5_EditarLibroFavorito";
import LectorAutoresFavoritos from "./pages/6_LectorAutoresFavoritos";
import VerLectorAutoresFavoritos from "./pages/6_VerLectorAutoresFavoritos";
import EditarLectorAutoresFavoritos from "./pages/6_EditarLectorAutoresFavoritos";
import NuevoLectorAutoresFavoritos from "./pages/6_NuevoLectorAutoresFavoritos";
import Seguidores from "./pages/7_Seguidores"
import AgregarNuevoSeguidor from "./pages/7_AgregarNuevoSeguidor";
import EditarSeguidos from "./pages/7_EditarSeguidos";
import Reviews from "./pages/8_Reviews";
import NuevaReview from "./pages/8_NuevaReview";
import VerReviews from "./pages/8_VerReviews";
import EditarReview from "./pages/8_EditarReview";


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
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
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

      <Route path="/libro" element={<Libro />} />
      <Route path="/nuevo_libro" element={<NuevoLibro />} />
      <Route path="/ver_libro/:theId" element={<VerLibro />} />
      <Route path="/editar_libro/:theId" element={<EditarLibro />} />

      <Route path="/lector/:lectorId/favoritos" element={<LibrosFavoritos />} />
      <Route path="/lector/:lectorId/favoritos/agregar" element={<AgregarLibroFavorito />} />
      <Route path="/lector/:lectorId/favoritos/editar/:favId" element={<EditarLibroFavorito />} />

      <Route path="/lector_autores_favoritos" element={<LectorAutoresFavoritos />} />
      <Route path="/nuevo_lector_autores_favoritos" element={<NuevoLectorAutoresFavoritos />} />
      <Route path="/ver_lector_autores_favoritos/:theId" element={<VerLectorAutoresFavoritos />} />
      <Route path="/editar_lector_autores_favoritos/:theId" element={<EditarLectorAutoresFavoritos />} />

      <Route path="/ver_seguidores" element={<Seguidores />} />
      <Route path="/nuevo_seguidor" element={<AgregarNuevoSeguidor />} />
      <Route path="/editar_seguido/:segId" element={<EditarSeguidos />} />

      <Route path="/review" element={<Reviews />} />
      <Route path="/nueva_review" element={<NuevaReview />} />
      <Route path="/ver_review/:theId" element={<VerReviews />} />
      <Route path="/editar_review/:theId" element={<EditarReview />} />

      </Route>
    )
);