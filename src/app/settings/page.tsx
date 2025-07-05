
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Monitor, Sun, Moon, Bell, Languages } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [language, setLanguage] = useState('en-us');
    const [pushNotifications, setPushNotifications] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application preferences.</p>
            </header>
            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme" className="flex items-center gap-3">
                                <span className="p-2 bg-muted rounded-full">
                                    {theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                </span>
                                <div>
                                    <p className="font-semibold">Theme</p>
                                    <p className="text-xs text-muted-foreground">Select the application theme.</p>
                                </div>
                            </Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>
                            Manage language and regional settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="language" className="flex items-center gap-3">
                                <span className="p-2 bg-muted rounded-full">
                                    <Languages className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-semibold">Language</p>
                                    <p className="text-xs text-muted-foreground">Select your preferred language.</p>
                                </div>
                            </Label>
                             <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-us">English</SelectItem>
                                    <SelectItem value="bn-bd">বাংলা</SelectItem>
                                    <SelectItem value="hi-in">हिंदी</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Manage how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifications" className="flex items-center gap-3">
                                <span className="p-2 bg-muted rounded-full">
                                    <Bell className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-semibold">Push Notifications</p>
                                    <p className="text-xs text-muted-foreground">Receive notifications on your device.</p>
                                </div>
                            </Label>
                            <Switch 
                                id="push-notifications"
                                checked={pushNotifications}
                                onCheckedChange={setPushNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
