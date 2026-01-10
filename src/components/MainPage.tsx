import {type FC, useState} from "react";
import {Button, Layout, Space} from 'antd';
import {AimOutlined, BulbOutlined, VerticalAlignMiddleOutlined} from "@ant-design/icons";
import {Content, Header} from "antd/es/layout/layout";
import {ChartsPage} from "./ChartsPage";
import Title from "antd/es/typography/Title";
import type {LocationInfo} from "../types/location.types";
import {getSelectedLocation, getUserLocation, saveSelectedLocation} from "../utils/location";
import {searchLocations} from "../utils/locationSearch";
import {LocationSearchButton} from "./LocationSearchButton";
import {useTheme} from "../context/ThemeContext";

export const MainPage: FC = () => {
    const [isCentralDate, setIsCentralDate] = useState<boolean>(true);
    const [location, setLocation] = useState<LocationInfo>(getSelectedLocation());
    const [loading, setLoading] = useState<boolean>(false);
    const {isDarkMode, toggleDarkMode} = useTheme();

    const updateLocation = (refresh: boolean) => {
        setLoading(true);
        getUserLocation(refresh).then((res) => {
            setLocation(res);
            setLoading(false);
            saveSelectedLocation(res);
        });
    }

    const handleLocationSelect = (location: LocationInfo) => {
        setLocation(location);
        saveSelectedLocation(location);
    };

    return (
        <Layout style={{
            height: 'calc(100vh - 46px)',
            background: '#ffffff',
        }}>
            <Header style={{
                background: '#ffffff',
                height: 'auto',
                minHeight: '46px',
                padding: '0 16px',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <Space>
                    <Button icon={<VerticalAlignMiddleOutlined style={{transform: 'rotate(90deg)'}}/>}
                            onClick={() => setIsCentralDate(!isCentralDate)}
                            type={isCentralDate ? "primary" : "default"}
                            size="large"
                    />
                    <Button icon={<BulbOutlined/>}
                            onClick={toggleDarkMode}
                            type={isDarkMode ? "primary" : "default"}
                            size="large"
                    />
                    <Button icon={<AimOutlined/>}
                            size="large"
                            loading={loading}
                            onClick={() => updateLocation(true)}
                    />
                    <LocationSearchButton
                        onLocationSelect={handleLocationSelect}
                        searchLocations={searchLocations}
                    />
                </Space>
                <Title level={3}
                       style={{
                           margin: 0
                       }}>
                    {location.name}
                </Title>

            </Header>
            <Content style={{
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vw * 0.8)'
            }}>
                <ChartsPage isCentralDate={isCentralDate}
                            latitude={location.latitude}
                            longitude={location.longitude}
                />
            </Content>
        </Layout>
    )
}
