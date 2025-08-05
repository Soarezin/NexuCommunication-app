import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
    id: string;
    name: string;
    description?: string;
}

interface User {
    id: string;
    firstName: string;
    email: string;
}

interface EditUserDialogProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: { userId: string; permissionIds: string[] }) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, isOpen, onClose, onSave }) => {
    const [firstName, setName] = useState(user?.firstName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user?.id) return;

        const fetchPermissions = async () => {
            try {
                // 1. Buscar todas as permissões disponíveis
                const allRes = await axios.get('/permissions');
                setAllPermissions(allRes.data);

                // 2. Buscar permissões do usuário específico
                const userRes = await axios.get(`/permissions/${user.id}`);
                const userPerms: Permission[] = userRes.data.permissions;

                // 3. Montar Set com os IDs
                setSelectedPermissionIds(new Set(userPerms.map((p) => p.id)));

                // 4. Resetar dados básicos
                setName(user.firstName);
                setEmail(user.email);
            } catch (err) {
                console.error("Erro ao carregar permissões:", err);
            }
        };

        fetchPermissions();
    }, [user]);

    const togglePermission = (permissionId: string) => {
        setSelectedPermissionIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(permissionId)) {
                updated.delete(permissionId);
            } else {
                updated.add(permissionId);
            }
            return updated;
        });
    };

    const handleSave = () => {
        onSave({
            userId: user.id,
            permissionIds: Array.from(selectedPermissionIds),
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Permissões de {user?.firstName || 'Usuário'}</DialogTitle>
                    <DialogDescription>Atualize as permissões deste usuário.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nome</label>
                        <Input value={firstName} onChange={(e) => setName(e.target.value)} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Permissões</label>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {allPermissions.map((perm) => (
                                <div key={perm.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={selectedPermissionIds.has(perm.id)}
                                        onCheckedChange={() => togglePermission(perm.id)}
                                    />
                                    <span>{perm.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog;
