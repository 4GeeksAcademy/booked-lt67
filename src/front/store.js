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
    auth_autor: false,
    auth_lector: false,
    auth_editorial: false,
    auth_admin: false
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
        auth_autor: action.payload
      };

    case 'set_auth_lector':
      return {
        ...store,
        auth_lector: action.payload
      };
      
    case 'set_auth_editorial':
      return {
        ...store,
        auth_editorial: action.payload
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
