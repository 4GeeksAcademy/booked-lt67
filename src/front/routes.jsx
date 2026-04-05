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
import LogInAutor from "./pages/10_LoginAutor";
import SignUpAutor from "./pages/10_SignUpAutor";
import LogInLector from "./pages/9_LogInLector";
import SignUpLector from "./pages/9_SingUpLector";
import LogInEditorial from "./pages/11_LogInEditorial";
import SignUpEditorial from "./pages/11_SignUpEditorial";
import LogInAdmin from "./pages/12_LoginAdmin";
import SignUpAdmin from "./pages/12_SignUpAdmin";
import TodosLosPostEditorial from "./pages/15_TodosLosPostEditorial";
import VerPostEditorial from "./pages/15_VerPostEditorial";
import CrearPostEditorial from "./pages/15_CrearPostEditorial";
import CrearPostEditorialbyId from "./pages/15_CrearPostEditorialById";
import PaginaEditorial from "./pages/15_PaginaEditorial";
import NuevoLibroEditorial from "./pages/15_NuevoLibroEditorial";
import EditarLibroEditorial from "./pages/15_EditarLibroEditorial";
import ActualizarEditorial from "./pages/15_ActualizarEditorial";
import PaginaLector from "./pages/13_PaginaLector";
import FormularioReview from "./pages/13_FormularioReview";
import AdminHome from "./pages/16_AdminHome";
import PostSinLogin from "./pages/17_Post_sin_login";
import PaginaAutor from "./pages/14_PaginaAutor";
import CrearPostAutor from "./pages/14_PostAutor";
import VerPerfilAutorEditorial from "./pages/18_VerPerfilAutorEditorial";
import VerAutorFree from "./pages/18_VerAutor_Free";
import VerEditorialFree from "./pages/18_VerEditorialFree";
import ActualizarAutor from "./pages/20_ActualizarAutor";

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

      <Route path="/login_lector" element={<LogInLector />} />
      <Route element={<SignUpLector />} path="/signup_lector" />

      <Route path="/login_autor" element={<LogInAutor />} />
      <Route element={<SignUpAutor />} path="/signup_autor" />

      <Route path="/login_editorial" element={<LogInEditorial />} />
      <Route element={<SignUpEditorial />} path="/signup_editorial" />

      <Route path="/login_admin" element={<LogInAdmin />} />
      <Route element={<SignUpAdmin />} path="/signup_admin" />


      <Route path="/pagina_editorial" element={<PaginaEditorial />} />    
      <Route path="/all_post_editorial" element={<TodosLosPostEditorial />} />
      <Route path="/post_editorial/:theId" element={<VerPostEditorial />} />
      <Route path="/nueva_publicacion_editorial" element={<CrearPostEditorial />} />
      <Route path="/nueva_publicacion_editorial/:theId" element={<CrearPostEditorialbyId />} />
      <Route path="/nuevo_libro_editorial/:theId" element={<NuevoLibroEditorial />} />
      <Route path="/editar_libro_editorial/:theId" element={<EditarLibroEditorial />} />
      <Route path="/actualizar_editorial/:theId" element={<ActualizarEditorial />} />


      <Route path="/pagina_lector" element={<PaginaLector />} />
      <Route path="/pagina_lector/:theId/reviews" element={<FormularioReview />} />

      <Route path="/admin_home" element={<AdminHome />} />

      <Route path="/post_free" element={<PostSinLogin />} />

      <Route path="/pagina_autor" element={<PaginaAutor />} />
      <Route path="/crear_post_autor" element={<CrearPostAutor />} />

      <Route path="/ver_autor_editorial" element={<VerPerfilAutorEditorial />} />
      <Route path="/ver_autor_free/:theId" element={<VerAutorFree />} />
      <Route path="/ver_editorial_free/:theId" element={<VerEditorialFree />} />

      <Route path="/actualizar_autor/:theId" element={<ActualizarAutor />} />

      </Route>
    )
);