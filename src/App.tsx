import './App.css'
import {MainPage} from "./components/MainPage";
import {ThemeProvider} from "./context/ThemeContext";

function App() {

    return (
        <ThemeProvider>
            <MainPage/>
        </ThemeProvider>
    )
}

export default App
