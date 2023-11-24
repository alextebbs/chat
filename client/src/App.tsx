import { Provider } from "react-redux";
import { store } from "./store";
import Chat from "./Chat";

function App() {
  return (
    <Provider store={store}>
      <Chat />
    </Provider>
  );
}

export default App;
