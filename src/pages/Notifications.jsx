import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications - Hadith & Quran CMS</title>
        <meta name="description" content="View and manage system notifications, alerts, and activity updates." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with system activities and alerts
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="hover:bg-accent"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="outline"
                onClick={clearNotifications}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Notifications</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Read</p>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Feed</CardTitle>
            <CardDescription>
              A log of all system and user-generated notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hidden">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground" title={format(new Date(notification.timestamp), 'PPP p')}>
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">
                    Your notification feed is empty.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Notifications;