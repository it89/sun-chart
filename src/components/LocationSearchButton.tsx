import React, {useState, useEffect, useCallback} from 'react';
import {Button, Modal, Input, List, Alert, Col} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import type {LocationInfo, LocationSearchInfo} from "../types/location.types";

interface LocationSearchModalProps {
    onLocationSelect: (location: LocationInfo) => void;
    searchLocations: (query: string) => Promise<LocationSearchInfo[]>;
}

export const LocationSearchButton: React.FC<LocationSearchModalProps> = ({
                                                                             onLocationSelect,
                                                                             searchLocations,
                                                                         }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationSearchInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const performSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await searchLocations(searchQuery.trim());
            setSearchResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error');
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, searchLocations]);

    const handleSelectLocation = (location: LocationInfo) => {
        onLocationSelect(location);
        handleCloseModal();
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setError(null);
        }
    }, [searchQuery]);

    const renderSearchResults = () => {
        if (error) {
            return (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{marginTop: 16}}
                />
            );
        }

        if (searchResults.length > 0) {
            return (
                <List
                    dataSource={searchResults}
                    renderItem={(location) => (
                        <List.Item
                            onClick={() => handleSelectLocation(location)}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                border: '1px solid #f0f0f0',
                                borderRadius: 4,
                                marginBottom: 8,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#1890ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#f0f0f0';
                            }}
                        >
                            <List.Item.Meta
                                title={location.name}
                                description={location.fullName}
                            />
                        </List.Item>
                    )}
                />
            );
        }

        return null;
    };

    return (
        <>
            <Button
                icon=<SearchOutlined/>
                onClick={handleOpenModal}
                size="large"
            />

            <Modal
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
            >
                <Col span={24}>
                    <Input.Search
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={performSearch}
                        enterButton={
                            <Button type="primary"
                                    loading={isLoading}
                                    icon=<SearchOutlined/>
                            />
                        }
                        size="large"
                        style={{"marginTop": 30}}
                    />
                </Col>
                <Col span={24}
                     style={{
                         "minHeight": 80,
                         "marginTop": 20
                     }}>
                    {renderSearchResults()}
                </Col>
            </Modal>
        </>
    );
};
