import { createContext, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";

export const DataContext = createContext(null);

const DataContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currRoom, setCurrRoom] = useState(null);
    const socket = useMemo(() => io(process.env.REACT_APP_BACKEND_URL), []);

    return (
        <DataContext.Provider value={{ user, currRoom, setUser, setCurrRoom, socket }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContextProvider;