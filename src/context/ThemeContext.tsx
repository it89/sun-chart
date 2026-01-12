import {createContext, type FC, type PropsWithChildren, useContext, useState} from "react";
import {ConfigProvider, theme} from "antd";

interface ThemeContextValue {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const THEME_STORAGE_KEY = "sun_chart_theme";

const getInitialTheme = (): boolean => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
            return true;
        }
        return stored === "dark";
    } catch {
        return true;
    }
};

const defaultTheme: ThemeContextValue = {
    isDarkMode: true,
    toggleDarkMode: () => {
    },
}

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

export const ThemeProvider: FC<PropsWithChildren> = ({children}) => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            try {
                localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
            } catch {
                // ignore
            }
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{isDarkMode, toggleDarkMode}}>
            <ConfigProvider
                theme={{
                    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
