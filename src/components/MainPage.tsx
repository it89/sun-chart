import {type FC, useEffect, useState} from "react";
import {Button, Layout, Space} from 'antd';
import {AimOutlined, VerticalAlignMiddleOutlined} from "@ant-design/icons";
import {Content, Header} from "antd/es/layout/layout";
import {ChartsPage} from "./ChartsPage";
import Title from "antd/es/typography/Title";
import type {LocationInfo} from "../types/location.types";
import {getLastLocationOrDefault, getLocationWithMemory} from "../utils/locationCache";


export const MainPage: FC = () => {
    const [isCentralDate, setIsCentralDate] = useState<boolean>(true);
    const [location, setLocation] = useState<LocationInfo>(getLastLocationOrDefault());
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getLocation(false);
    }, []);

    const getLocation = (refresh: boolean) => {
        setLoading(true);
        getLocationWithMemory(refresh).then((res) => {
            setLocation(res);
            setLoading(false);
        });
    }

    return (
        <Layout style={{
            height: 'calc(100vh - 46px)',
            background: '#ffffff',
        }}>
            <Header style={{
                background: '#ffffff',
                height: '46px',
                lineHeight: '46px',
                padding: '0 16px',
                borderBottom: '1px solid #f0f0f0',
                margin: 0
            }}>
                <Space>
                    <Button icon={<VerticalAlignMiddleOutlined style={{transform: 'rotate(90deg)'}}/>}
                            onClick={() => setIsCentralDate(!isCentralDate)}
                            type={isCentralDate ? "primary" : "default"}
                            size="large"
                    />
                    <Button icon={<AimOutlined/>}
                            size="large"
                            loading={loading}
                            onClick={() => getLocation(true)}
                    />
                    <Title level={3}
                           style={{
                               margin: 0
                           }}>
                        {location.name}
                    </Title>
                </Space>
            </Header>
            <Content style={{
                margin: 10,
                padding: 10,
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <ChartsPage isCentralDate={isCentralDate}
                            latitude={location.latitude}
                            longitude={location.longitude}/>
            </Content>
        </Layout>
    )
}
