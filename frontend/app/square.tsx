import React, { useState } from 'react';
import {

View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
FlatList,
Image,
} from 'react-native';

interface Post {
id: string;
author: string;
avatar: string;
content: string;
likes: number;
comments: number;
timestamp: string;
}

const SquarePage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([
        {
            id: '1',
            author: 'CryptoTrader',
            avatar: '👤',
            content: 'Bitcoin breaking resistance at $45K! Strong bullish signal 📈',
            likes: 234,
            comments: 42,
            timestamp: '2h ago',
        },
        {
            id: '2',
            author: 'MarketAnalyst',
            avatar: '📊',
            content: 'ETH showing strong fundamentals for Q4. Building positions.',
            likes: 156,
            comments: 28,
            timestamp: '4h ago',
        },
        {
            id: '3',
            author: 'CommunityMod',
            avatar: '🎯',
            content: 'New trading pairs available on Binance Square! Check them out.',
            likes: 512,
            comments: 89,
            timestamp: '6h ago',
        },
    ]);

    const renderPost = ({ item }: { item: Post }) => (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <Text style={styles.avatar}>{item.avatar}</Text>
                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{item.author}</Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            <View style={styles.postFooter}>
                <TouchableOpacity style={styles.action}>
                    <Text style={styles.actionText}>👍 {item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.action}>
                    <Text style={styles.actionText}>💬 {item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.action}>
                    <Text style={styles.actionText}>↗️ Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Square</Text>
                <Text style={styles.subtitle}>Community Trading Insights</Text>
            </View>

            <TouchableOpacity style={styles.postButton}>
                <Text style={styles.postButtonText}>+ Create Post</Text>
            </TouchableOpacity>

            <View style={styles.filterBar}>
                <TouchableOpacity style={[styles.filterTab, styles.activeTab]}>
                    <Text style={styles.activeFilterText}>For You</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterTab}>
                    <Text style={styles.filterText}>Following</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterTab}>
                    <Text style={styles.filterText}>Trending</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
},
header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
},
title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
},
subtitle: {
    fontSize: 14,
    color: '#888',
},
postButton: {
    margin: 16,
    backgroundColor: '#f0b90b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
},
postButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
},
filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 16,
},
filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
},
activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f0b90b',
},
filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
},
activeFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
},
postCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
},
postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
},
avatar: {
    fontSize: 32,
    marginRight: 12,
},
authorInfo: {
    flex: 1,
},
authorName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
},
timestamp: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
},
content: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
},
postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
},
action: {
    paddingVertical: 8,
    paddingHorizontal: 12,
},
actionText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
},
});

export default SquarePage;