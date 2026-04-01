export const initialStore=()=>{
  return{
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ],
    auth_autor: !!localStorage.getItem("token_autor"),
    autor_id: localStorage.getItem("autor_id") || null,
    auth_admin: false,
    auth_editorial: false,
    editorial_id: localStorage.getItem("editorial_id") || null,
    nombre_editorial: null,
    auth_lector: !!localStorage.getItem("token_lector"),
    lector_id: localStorage.getItem("lector_id") || null,
    nombre_lector: localStorage.getItem("nombre_lector") || null

  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'set_auth_autor':
      return {
        ...store,
        auth_autor: action.payload,
        autor_id: action.payload.id,
        nombre_autor: action.payload.nombre
      };

    case 'set_auth_lector':
      return {
        ...store,
        auth_lector: action.payload.auth,
        lector_id: action.payload.id,
        nombre_lector: action.payload.nombre
      };
      
    case "set_auth_editorial":
    return {
        ...store,
        auth_editorial: action.payload.auth,
        editorial_id: action.payload.id,
        nombre_editorial: action.payload.nombre
    };
    
    case 'set_auth_admin':
      return {
        ...store,
        auth_admin: action.payload
      };
            
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}
