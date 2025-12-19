import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head } from '@inertiajs/react';
import { Loader2, Plus, User, Mail, Phone, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import SellerLayout from '../../layouts/SellerLayout';
import axios from 'axios';

// Types
interface User {
    id: number;
    name: string;
    email: string;
    mobile: string;
    user_type: string;
    email_verified_at: string | null;
    created_at: string;
}

const ManageUsers = () => {
    // State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    // New User Form
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
    });

    // Validation Errors
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Fetch Users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/users');
            if (response.data.status === 'success') {
                // Filter only admin users
                const adminUsers = response.data.data.filter(
                    (user: User) => user.user_type === 'admin'
                );
                setUsers(adminUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Handle Create User
    const handleCreateUser = async () => {
        // Clear previous errors
        setErrors({});

        // Basic validation
        if (!newUser.name.trim()) {
            setErrors((prev) => ({ ...prev, name: 'Name is required' }));
            return;
        }
        if (!newUser.email.trim()) {
            setErrors((prev) => ({ ...prev, email: 'Email is required' }));
            return;
        }
        if (!newUser.mobile.trim()) {
            setErrors((prev) => ({ ...prev, mobile: 'Mobile is required' }));
            return;
        }
        if (!newUser.password) {
            setErrors((prev) => ({ ...prev, password: 'Password is required' }));
            return;
        }
        if (newUser.password.length < 8) {
            setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
            return;
        }
        if (newUser.password !== newUser.password_confirmation) {
            setErrors((prev) => ({ ...prev, password_confirmation: 'Passwords do not match' }));
            return;
        }

        setIsCreating(true);
        try {
            const response = await axios.post('/api/users/admin', {
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                password: newUser.password,
                password_confirmation: newUser.password_confirmation,
            });

            if (response.data.status === 'success') {
                toast.success('Admin user created successfully');
                fetchUsers();
                setIsUserModalOpen(false);
                setNewUser({
                    name: '',
                    email: '',
                    mobile: '',
                    password: '',
                    password_confirmation: '',
                });
                setErrors({});
            }
        } catch (error: any) {
            console.error('Error creating user:', error);
            
            // Handle validation errors from server
            if (error.response?.data?.errors) {
                const serverErrors: { [key: string]: string } = {};
                Object.keys(error.response.data.errors).forEach((key) => {
                    const errorMessages = error.response.data.errors[key];
                    serverErrors[key] = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
                });
                setErrors(serverErrors);
            } else {
                toast.error(error.response?.data?.message || 'Failed to create admin user');
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setNewUser((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <SellerLayout>
            <Head title="Manage Admin Users" />
            
            <div className="container mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Users</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage administrator accounts
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsUserModalOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Admin User
                    </Button>
                </div>

                {/* Users Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg border">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No admin users found</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by creating your first admin user
                        </p>
                        <Button onClick={() => setIsUserModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Admin User
                        </Button>
                    </div>
                ) : (
                    <div className="bg-card rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Name</th>
                                        <th className="text-left p-4 font-semibold">Email</th>
                                        <th className="text-left p-4 font-semibold">Mobile</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-left p-4 font-semibold">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{user.mobile}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create User Modal */}
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Admin User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="Enter full name"
                                        value={newUser.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={newUser.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            {/* Mobile */}
                            <div className="space-y-2">
                                <Label htmlFor="mobile">
                                    Mobile <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="+94 or +81 format"
                                        value={newUser.mobile}
                                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                                        className={`pl-10 ${errors.mobile ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.mobile && (
                                    <p className="text-sm text-destructive">{errors.mobile}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        value={newUser.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={newUser.password_confirmation}
                                        onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                        className={`pl-10 ${errors.password_confirmation ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsUserModalOpen(false);
                                    setNewUser({
                                        name: '',
                                        email: '',
                                        mobile: '',
                                        password: '',
                                        password_confirmation: '',
                                    });
                                    setErrors({});
                                }}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreateUser} disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Admin User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SellerLayout>
    );
};

export default ManageUsers;
