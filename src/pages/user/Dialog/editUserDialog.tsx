import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
    name: string;
    email: string;
    permissions: { [key: string]: boolean };
}

interface EditUserDialogProps {
    user: User;
    onSave: (updatedUser: User) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, onSave }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [permissions, setPermissions] = useState(user.permissions);
    const [allPermissions, setAllPermissions] = useState<string[]>([]);

    const handlePermissionChange = (permission: string) => {
        setPermissions((prev) => ({
            ...prev,
            [permission]: !prev[permission],
        }));
    };

    const handleSave = () => {
        onSave({ name, email, permissions });
    };

    useEffect(() => {
        const fetchAllPermissions = async () => {
            try {
                const response = await axios.get('/permissions'); // Endpoint para buscar todas as permissões
                const data: string[] = response.data;
                setAllPermissions(data);

                // Inicializa as permissões do usuário com todas as permissões disponíveis
                setPermissions((prev) => {
                    const updatedPermissions = { ...prev };
                    data.forEach((permission) => {
                        if (!(permission in updatedPermissions)) {
                            updatedPermissions[permission] = false;
                        }
                    });
                    return updatedPermissions;
                });
            } catch (error) {
                console.error('Error fetching all permissions:', error);
            }
        };

        fetchAllPermissions();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Edit User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>Update user details and permissions.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Permissions</label>
                        <div className="space-y-2">
                            {allPermissions.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={permissions[permission] || false}
                                        onCheckedChange={() => handlePermissionChange(permission)}
                                    />
                                    <span>{permission}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog;
