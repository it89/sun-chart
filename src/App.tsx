import './App.css'
import {useState} from "react";
import {Button, Layout} from 'antd';
import {VerticalAlignMiddleOutlined} from "@ant-design/icons";
import {ChartsPage} from "./components/ChartsPage";
import {Content, Header} from "antd/es/layout/layout";

function App() {
    const [isCentralDate, setIsCentralDate] = useState<boolean>(true);
    return (
        <>
            <Layout style={{
                height: 'calc(100vh - 46px)',
                background: '#ffffff'
            }}>
                <Header style={{
                    background: '#ffffff',
                    height: '46px',
                    lineHeight: '46px',
                    padding: '0 16px',
                    borderBottom: '1px solid #f0f0f0',
                    margin: 0
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <Button icon={<VerticalAlignMiddleOutlined style={{transform: 'rotate(90deg)'}}/>}
                                onClick={() => setIsCentralDate(!isCentralDate)}
                                type={isCentralDate ? "primary" : "default"}
                                size="large"
                        />
                    </div>
                </Header>
                <Content style={{
                    margin: 10,
                    padding: 10,
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ChartsPage isCentralDate={isCentralDate}/>
                </Content>
            </Layout>
        </>
    )
}

export default App
